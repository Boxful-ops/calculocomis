const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const csv = require('csv-parser');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const { HubSpotClient } = require('@hubspot/api-client');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/commission_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// HubSpot client initialization
let hubspotClient = null;
if (process.env.HUBSPOT_PRIVATE_APP_TOKEN) {
  hubspotClient = new HubSpotClient({ accessToken: process.env.HUBSPOT_PRIVATE_APP_TOKEN });
}

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'admin', 'seller'], default: 'seller' },
  permissions: [{
    module: String,
    canCreate: Boolean,
    canRead: Boolean,
    canUpdate: Boolean,
    canDelete: Boolean
  }],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Lead Schema
const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  affiliationDate: { type: Date, required: true },
  shipments: [{
    date: Date,
    amount: Number,
    commission: Number
  }],
  totalCommission: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'pending' },
  hubspotContactId: { type: String },
  hubspotCompanyId: { type: String }
});

const Lead = mongoose.model('Lead', leadSchema);

// Commission Schema
const commissionSchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  shipments: { type: Number, required: true },
  commissionRate: { type: Number, required: true },
  totalCommission: { type: Number, required: true },
  tier: { type: String },
  status: { type: String, enum: ['full', 'half', 'next_month'], default: 'full' },
  processedAt: { type: Date, default: Date.now },
  hubspotMatched: { type: Boolean, default: false }
});

const Commission = mongoose.model('Commission', commissionSchema);

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Super Admin middleware
const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Se requiere rol de super administrador' });
  }
  next();
};

// HubSpot integration functions
async function searchHubSpotContact(clientName) {
  if (!hubspotClient) {
    return null;
  }

  try {
    const response = await hubspotClient.crm.contacts.searchApi.doSearch({
      filterGroups: [
        {
          filters: [
            {
              propertyName: 'firstname',
              operator: 'CONTAINS_TOKEN',
              value: clientName.split(' ')[0]
            },
            {
              propertyName: 'lastname',
              operator: 'CONTAINS_TOKEN',
              value: clientName.split(' ').slice(1).join(' ')
            }
          ]
        }
      ],
      sorts: [],
      limit: 10,
      after: 0,
      properties: ['firstname', 'lastname', 'email', 'company', 'createdate']
    });

    return response.results;
  } catch (error) {
    console.error('Error searching HubSpot contact:', error);
    return null;
  }
}

async function searchHubSpotCompany(companyName) {
  if (!hubspotClient) {
    return null;
  }

  try {
    const response = await hubspotClient.crm.companies.searchApi.doSearch({
      filterGroups: [
        {
          filters: [
            {
              propertyName: 'name',
              operator: 'CONTAINS_TOKEN',
              value: companyName
            }
          ]
        }
      ],
      sorts: [],
      limit: 10,
      after: 0,
      properties: ['name', 'domain', 'createdate']
    });

    return response.results;
  } catch (error) {
    console.error('Error searching HubSpot company:', error);
    return null;
  }
}

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

app.get('/api/auth/verify', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error al verificar token' });
  }
});

// User management routes
app.get('/api/users', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
});

app.post('/api/users', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { username, email, password, role, permissions } = req.body;
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role,
      permissions
    });

    await user.save();
    res.status(201).json({ message: 'Usuario creado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear usuario' });
  }
});

app.put('/api/users/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { username, email, password, role, permissions } = req.body;
    const updateData = { username, email, role, permissions };
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    await User.findByIdAndUpdate(req.params.id, updateData);
    res.json({ message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
});

app.delete('/api/users/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
});

// File upload routes
app.post('/api/upload/csv', authenticateToken, upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se subió ningún archivo' });
    }

    const results = [];
    const filePath = path.join(__dirname, req.file.path);
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        let processedCount = 0;
        let hubspotMatches = 0;
        
        for (const row of results) {
          try {
            const lead = new Lead({
              name: row.name,
              email: row.email,
              affiliationDate: new Date(row.affiliationDate),
              status: 'active'
            });

            // Search in HubSpot
            if (hubspotClient) {
              const hubspotContacts = await searchHubSpotContact(row.name);
              if (hubspotContacts && hubspotContacts.length > 0) {
                lead.hubspotContactId = hubspotContacts[0].id;
                hubspotMatches++;
              }
            }

            await lead.save();
            processedCount++;
          } catch (error) {
            console.error('Error processing lead:', error);
          }
        }
        
        res.json({ 
          message: `Se procesaron ${processedCount} leads`,
          hubspotMatches: hubspotMatches
        });
      });
  } catch (error) {
    res.status(500).json({ message: 'Error al procesar archivo CSV' });
  }
});

app.post('/api/upload/xls', authenticateToken, upload.single('xlsFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se subió ningún archivo' });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const processedData = [];
    let hubspotMatches = 0;
    
    for (const row of data) {
      const clientName = row['Cliente'] || row['cliente'] || row['Client'];
      const shipmentCount = row['Envios'] || row['envíos'] || row['Shipments'] || 0;
      
      if (clientName) {
        const lead = await Lead.findOne({ name: clientName });
        if (lead) {
          const commission = calculateCommission(lead, shipmentCount);
          
          // Search in HubSpot for verification
          let hubspotMatched = false;
          if (hubspotClient) {
            const hubspotContacts = await searchHubSpotContact(clientName);
            if (hubspotContacts && hubspotContacts.length > 0) {
              hubspotMatched = true;
              hubspotMatches++;
              
              // Update lead with HubSpot contact ID
              lead.hubspotContactId = hubspotContacts[0].id;
              await lead.save();
            }
          }
          
          processedData.push({
            client: clientName,
            shipments: shipmentCount,
            commission: commission.total,
            tier: commission.tier,
            status: commission.status,
            hubspotMatched: hubspotMatched
          });
        }
      }
    }

    res.json({ 
      message: `Se procesaron ${processedData.length} registros`,
      hubspotMatches: hubspotMatches,
      data: processedData
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al procesar archivo XLS' });
  }
});

// Commission calculation function
function calculateCommission(lead, shipments) {
  const now = new Date();
  const affiliationDate = new Date(lead.affiliationDate);
  const monthsDiff = (now.getFullYear() - affiliationDate.getFullYear()) * 12 + 
                    (now.getMonth() - affiliationDate.getMonth());
  
  let commissionRate, tiers, status = 'full';
  
  if (monthsDiff === 0) {
    // First month - $1 per shipment
    commissionRate = 1;
    tiers = [5, 30, 100, 300];
    
    // If affiliated on or after 21st, commissions count for next month
    if (affiliationDate.getDate() >= 21) {
      status = 'next_month';
    }
  } else if (monthsDiff === 1) {
    // Second month - $0.50 per shipment
    commissionRate = 0.5;
    tiers = [2.5, 15, 50, 150];
  } else {
    // After second month - no commission
    commissionRate = 0;
    tiers = [];
  }
  
  const totalCommission = shipments * commissionRate;
  let tier = '';
  
  for (let i = 0; i < tiers.length; i++) {
    if (totalCommission >= tiers[i]) {
      tier = `Tier ${i + 1}`;
    }
  }
  
  return {
    total: totalCommission,
    rate: commissionRate,
    tier: tier,
    status: status
  };
}

// Get commissions
app.get('/api/commissions', authenticateToken, async (req, res) => {
  try {
    const commissions = await Commission.find()
      .populate('leadId', 'name email')
      .sort({ processedAt: -1 });
    res.json(commissions);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener comisiones' });
  }
});

// Get leads
app.get('/api/leads', authenticateToken, async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener leads' });
  }
});

// Search leads
app.get('/api/leads/search', authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;
    const leads = await Lead.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar leads' });
  }
});

// Get dashboard stats
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLeads = await Lead.countDocuments();
    const totalCommissions = await Commission.aggregate([
      { $group: { _id: null, total: { $sum: '$totalCommission' } } }
    ]);
    const hubspotMatchedLeads = await Lead.countDocuments({ hubspotContactId: { $exists: true, $ne: null } });
    
    res.json({
      totalUsers,
      totalLeads,
      totalCommissions: totalCommissions[0]?.total || 0,
      hubspotMatchedLeads
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
});

// HubSpot sync endpoint
app.post('/api/hubspot/sync', authenticateToken, async (req, res) => {
  try {
    if (!hubspotClient) {
      return res.status(400).json({ message: 'HubSpot no está configurado' });
    }

    const leads = await Lead.find({ hubspotContactId: { $exists: false } });
    let syncedCount = 0;

    for (const lead of leads) {
      const hubspotContacts = await searchHubSpotContact(lead.name);
      if (hubspotContacts && hubspotContacts.length > 0) {
        lead.hubspotContactId = hubspotContacts[0].id;
        await lead.save();
        syncedCount++;
      }
    }

    res.json({
      message: `Se sincronizaron ${syncedCount} leads con HubSpot`,
      totalLeads: leads.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al sincronizar con HubSpot' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  if (hubspotClient) {
    console.log('HubSpot integration enabled');
  } else {
    console.log('HubSpot integration disabled - set HUBSPOT_PRIVATE_APP_TOKEN to enable');
  }
});
