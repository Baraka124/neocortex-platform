import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static('.'));

const DATA_FILE = path.join(__dirname, 'research.json');

function generateId(prefix = 'proj') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

async function initData() {
    try {
        await fs.access(DATA_FILE);
        console.log('📁 Research database loaded');
        return true;
    } catch {
        console.log('📁 Creating enhanced medical research database...');
        
        const initialData = {
            projects: {
                "gsk-copd-001": {
                    id: "gsk-copd-001",
                    title: "AI-Driven Treatable Traits in COPD",
                    description: "Machine learning identification of treatable traits in COPD patients for personalized intervention. This project aims to develop an AI model that can predict which COPD patients will respond best to specific treatments based on their clinical characteristics.",
                    status: "active",
                    phase: "Phase 2",
                    priority: "high",
                    tags: ["COPD", "AI", "Treatable-Traits", "GSK", "Clinical", "Machine Learning"],
                    lead: "Dr. Sarah Chen, MD, Pulmonology",
                    team: ["clinician1", "researcher2", "data-scientist3"],
                    institutions: ["GSK", "Mass General Hospital"],
                    startDate: "2024-01-15",
                    endDate: "2024-12-31",
                    milestones: [
                        { id: "m1", title: "Data Collection Complete", status: "completed", date: "2024-02-28" },
                        { id: "m2", title: "AI Model V1", status: "in-progress", date: "2024-04-15" },
                        { id: "m3", title: "Clinical Validation", status: "pending", date: "2024-08-30" }
                    ],
                    documents: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    discussionCount: 3
                },
                "gsk-asthma-002": {
                    id: "gsk-asthma-002",
                    title: "Asthma Exacerbation Prediction Model",
                    description: "Deep learning model to predict asthma exacerbations using EHR data and patient-reported outcomes. The goal is to identify patients at high risk of exacerbation 2-4 weeks in advance.",
                    status: "planning",
                    phase: "Phase 1",
                    priority: "medium",
                    tags: ["Asthma", "Prediction", "Deep-Learning", "GSK", "EHR", "Clinical"],
                    lead: "Dr. James Wilson, Clinical Researcher",
                    team: [],
                    institutions: ["GSK", "University Hospital"],
                    startDate: "2024-03-01",
                    endDate: "2024-11-30",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    discussionCount: 1
                },
                "gsk-remote-003": {
                    id: "gsk-remote-003",
                    title: "Remote Monitoring for Severe Asthma Patients",
                    description: "Digital platform for remote monitoring of severe asthma patients using wearable sensors and mobile app.",
                    status: "active",
                    phase: "Phase 1",
                    priority: "high",
                    tags: ["Asthma", "Remote Monitoring", "Digital Health", "Patient Safety", "Clinical"],
                    lead: "Dr. Maria Rodriguez, Pulmonologist",
                    team: ["tech-lead1", "clinician2"],
                    institutions: ["GSK", "Stanford Medicine"],
                    startDate: "2024-02-01",
                    endDate: "2024-10-31",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    discussionCount: 5
                }
            },
            
            discussions: {
                "disc-copd-001": {
                    id: "disc-copd-001",
                    projectId: "gsk-copd-001",
                    title: "Patient Privacy Concerns in Data Sharing",
                    content: "I have concerns about how patient data will be anonymized and shared between institutions. We need clear protocols before proceeding.",
                    author: "Dr. Sarah Chen, MD, Pulmonology",
                    highlights: "patient safety, data privacy, ethical considerations",
                    upvotes: 15,
                    downvotes: 2,
                    votes: {
                        "dr-sarah-chen": "up",
                        "clinician1": "up",
                        "john-doe": "up",
                        "dr-wilson": "up"
                    },
                    comments: [
                        { 
                            id: "c1", 
                            author: "John Doe, GSK Data Protection Officer", 
                            content: "We follow GDPR and HIPAA standards. All data is pseudonymized before sharing.",
                            date: "2024-01-16T10:30:00Z" 
                        },
                        { 
                            id: "c2", 
                            author: "Dr. James Wilson, Clinical Researcher", 
                            content: "Could we implement additional encryption for sensitive health metrics?",
                            date: "2024-01-16T14:20:00Z" 
                        }
                    ],
                    createdAt: "2024-01-15T09:00:00Z"
                },
                "disc-copd-002": {
                    id: "disc-copd-002",
                    projectId: "gsk-copd-001",
                    title: "Feasibility of Daily Spirometry Measurements",
                    content: "Requesting daily spirometry measurements may be too burdensome for elderly COPD patients. Suggest weekly measurements instead.",
                    author: "Dr. Maria Rodriguez, Pulmonologist",
                    highlights: "patient burden, feasibility, elderly patients",
                    upvotes: 12,
                    downvotes: 1,
                    votes: {},
                    comments: [],
                    createdAt: "2024-02-01T11:30:00Z"
                },
                "disc-asthma-001": {
                    id: "disc-asthma-001",
                    projectId: "gsk-asthma-002",
                    title: "Inclusion Criteria for High-Risk Patients",
                    content: "Should we include patients with recent hospitalization (within 3 months) or focus only on stable patients?",
                    author: "Dr. James Wilson, Clinical Researcher",
                    highlights: "patient selection, safety, study design",
                    upvotes: 8,
                    downvotes: 0,
                    votes: {},
                    comments: [],
                    createdAt: "2024-03-05T14:15:00Z"
                }
            },
            
            users: {
                "dr-sarah-chen": {
                    id: "dr-sarah-chen",
                    name: "Dr. Sarah Chen, MD",
                    role: "clinician",
                    specialty: "Pulmonology",
                    institution: "Mass General Hospital",
                    email: "sarah.chen@mgh.harvard.edu",
                    projects: ["gsk-copd-001"],
                    status: "active",
                    createdAt: "2024-01-01T00:00:00Z"
                },
                "john-doe": {
                    id: "john-doe",
                    name: "John Doe",
                    role: "industry",
                    title: "GSK Data Protection Officer",
                    institution: "GSK",
                    email: "john.doe@gsk.com",
                    projects: ["gsk-copd-001"],
                    status: "active",
                    createdAt: "2024-01-02T00:00:00Z"
                },
                "dr-maria-rodriguez": {
                    id: "dr-maria-rodriguez",
                    name: "Dr. Maria Rodriguez",
                    role: "clinician",
                    specialty: "Pulmonology",
                    institution: "Stanford Medicine",
                    email: "mrodriguez@stanford.edu",
                    projects: ["gsk-remote-003"],
                    status: "active",
                    createdAt: "2024-02-01T00:00:00Z"
                }
            },
            
            analytics: {
                totalVotes: 35,
                consensusRate: 78,
                topDiscussions: ["disc-copd-001", "disc-copd-002"],
                activeCollaborators: 15
            },
            
            config: {
                institution: "GSK Research Collaboration",
                theme: "medical",
                privacyLevel: "high",
                votingEnabled: true,
                requireRealNames: true
            }
        };
        
        await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
        console.log('✅ Enhanced medical research database created');
        return true;
    }
}

// AUTHENTICATION MIDDLEWARE (Simple version for demo)
function simpleAuth(req, res, next) {
    // In production, use proper JWT/auth
    const userToken = req.headers['authorization'];
    if (req.path === '/api/login' || req.path === '/login.html' || req.path === '/') {
        return next();
    }
    next(); // For demo, allow all
}

app.use(simpleAuth);

// API ENDPOINTS
app.get('/api/projects', async (req, res) => {
    try {
        const { status, tag, lead } = req.query;
        const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
        
        let projects = Object.values(data.projects);
        
        // Add discussion counts
        projects = projects.map(project => {
            const discussions = Object.values(data.discussions)
                .filter(d => d.projectId === project.id);
            return {
                ...project,
                discussionCount: discussions.length
            };
        });
        
        if (status) projects = projects.filter(p => p.status === status);
        if (tag) projects = projects.filter(p => p.tags?.includes(tag));
        if (lead) projects = projects.filter(p => p.lead === lead);
        
        projects.sort((a, b) => {
            const priorityOrder = { high: 1, medium: 2, low: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority] ||
                   new Date(b.updatedAt) - new Date(a.updatedAt);
        });
        
        res.json({ success: true, projects, count: projects.length });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/projects/:id', async (req, res) => {
    try {
        const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
        const project = data.projects[req.params.id];
        
        if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
        
        const discussions = Object.values(data.discussions)
            .filter(d => d.projectId === req.params.id)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        const teamDetails = project.team.map(memberId => data.users[memberId] || null);
        
        const analytics = {
            discussionCount: discussions.length,
            teamSize: project.team.length,
            milestoneProgress: project.milestones?.filter(m => m.status === 'completed').length || 0,
            totalVotes: discussions.reduce((sum, d) => sum + (d.upvotes || 0) + (d.downvotes || 0), 0),
            consensusScore: discussions.length > 0 ? 
                Math.round((discussions.reduce((sum, d) => sum + (d.upvotes || 0), 0) / 
                           discussions.reduce((sum, d) => sum + (d.upvotes || 0) + (d.downvotes || 0), 1)) * 100) : 0
        };
        
        res.json({
            success: true,
            project,
            discussions,
            team: teamDetails,
            analytics
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/projects', async (req, res) => {
    try {
        const { title, description, lead, tags } = req.body;
        
        if (!title || !description) {
            return res.status(400).json({ success: false, error: 'Title and description required' });
        }
        
        const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
        const id = generateId('gsk');
        
        const newProject = {
            id,
            title,
            description,
            status: "planning",
            phase: "Phase 1",
            priority: "medium",
            tags: [...(tags || []), "GSK"],
            lead: lead || "pending",
            team: [],
            institutions: ["GSK"],
            startDate: new Date().toISOString().split('T')[0],
            milestones: [],
            documents: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            discussionCount: 0
        };
        
        data.projects[id] = newProject;
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        
        res.json({ success: true, message: 'Project created', project: newProject });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// DISCUSSIONS WITH VOTING
app.get('/api/discussions', async (req, res) => {
    try {
        const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
        let discussions = Object.values(data.discussions);
        
        discussions.sort((a, b) => {
            const scoreA = (a.upvotes || 0) - (a.downvotes || 0);
            const scoreB = (b.upvotes || 0) - (b.downvotes || 0);
            return scoreB - scoreA || new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        res.json({ success: true, discussions, total: discussions.length });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/discussions', async (req, res) => {
    try {
        const { projectId, title, content, author, highlights } = req.body;
        
        if (!projectId || !title || !content || !author) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }
        
        const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
        
        // Check if project exists
        if (!data.projects[projectId]) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }
        
        const id = `disc-${projectId}-${Date.now()}`;
        
        const discussion = {
            id,
            projectId,
            title,
            content,
            author,
            highlights: highlights || "",
            upvotes: 0,
            downvotes: 0,
            votes: {},
            comments: [],
            createdAt: new Date().toISOString()
        };
        
        data.discussions[id] = discussion;
        
        // Update project discussion count
        if (data.projects[projectId]) {
            data.projects[projectId].discussionCount = 
                (data.projects[projectId].discussionCount || 0) + 1;
            data.projects[projectId].updatedAt = new Date().toISOString();
        }
        
        // Update analytics
        data.analytics.totalVotes = (data.analytics.totalVotes || 0);
        data.analytics.topDiscussions = Object.values(data.discussions)
            .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
            .slice(0, 3)
            .map(d => d.id);
        
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        
        res.json({ success: true, message: 'Discussion created', discussion });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// VOTING ENDPOINT
app.post('/api/discussions/:id/vote', async (req, res) => {
    try {
        const { userId, voteType, userRole } = req.body;
        const discussionId = req.params.id;
        
        if (!userId || !voteType) {
            return res.status(400).json({ success: false, error: 'User ID and vote type required' });
        }
        
        const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
        const discussion = data.discussions[discussionId];
        
        if (!discussion) {
            return res.status(404).json({ success: false, error: 'Discussion not found' });
        }
        
        // Initialize votes object if not exists
        if (!discussion.votes) discussion.votes = {};
        if (!discussion.upvotes) discussion.upvotes = 0;
        if (!discussion.downvotes) discussion.downvotes = 0;
        
        const previousVote = discussion.votes[userId];
        
        // Remove previous vote if exists
        if (previousVote === 'up') discussion.upvotes--;
        if (previousVote === 'down') discussion.downvotes--;
        
        // Add new vote
        discussion.votes[userId] = voteType;
        if (voteType === 'up') discussion.upvotes++;
        if (voteType === 'down') discussion.downvotes++;
        
        // Update analytics
        data.analytics.totalVotes = (data.analytics.totalVotes || 0) + 1;
        
        // Recalculate consensus rate
        const allDiscussions = Object.values(data.discussions);
        const totalUpvotes = allDiscussions.reduce((sum, d) => sum + (d.upvotes || 0), 0);
        const totalVotes = allDiscussions.reduce((sum, d) => sum + (d.upvotes || 0) + (d.downvotes || 0), 1);
        data.analytics.consensusRate = Math.round((totalUpvotes / totalVotes) * 100);
        
        // Update top discussions
        data.analytics.topDiscussions = allDiscussions
            .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
            .slice(0, 3)
            .map(d => d.id);
        
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        
        res.json({ 
            success: true, 
            message: 'Vote recorded', 
            upvotes: discussion.upvotes,
            downvotes: discussion.downvotes,
            userVote: voteType
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/discussions/:id/comments', async (req, res) => {
    try {
        const { author, content } = req.body;
        const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
        const discussion = data.discussions[req.params.id];
        
        if (!discussion) return res.status(404).json({ success: false, error: 'Discussion not found' });
        
        const comment = {
            id: `comment-${Date.now()}`,
            author: author || "anonymous",
            content,
            date: new Date().toISOString()
        };
        
        if (!discussion.comments) discussion.comments = [];
        discussion.comments.push(comment);
        
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        
        res.json({ success: true, message: 'Comment added', comment });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/projects/:id/team', async (req, res) => {
    try {
        const { memberName, role, addedBy } = req.body;
        const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
        const project = data.projects[req.params.id];
        
        if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
        
        // Generate user ID from name
        const userId = memberName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        
        // Create user if not exists
        if (!data.users[userId]) {
            data.users[userId] = {
                id: userId,
                name: memberName,
                role: role.includes('clinician') || role.includes('Dr.') ? 'clinician' : 'industry',
                institution: "Unknown",
                projects: [req.params.id],
                status: "active",
                createdAt: new Date().toISOString()
            };
        } else if (!data.users[userId].projects.includes(req.params.id)) {
            data.users[userId].projects.push(req.params.id);
        }
        
        // Add to project team if not already there
        if (!project.team.includes(userId)) {
            project.team.push(userId);
            project.updatedAt = new Date().toISOString();
        }
        
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        
        res.json({ 
            success: true, 
            message: 'Team member added', 
            member: data.users[userId],
            teamSize: project.team.length 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/analytics', async (req, res) => {
    try {
        const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
        const projects = Object.values(data.projects);
        const discussions = Object.values(data.discussions);
        const users = Object.values(data.users);
        
        const analytics = {
            projects: {
                total: projects.length,
                active: projects.filter(p => p.status === 'active').length,
                planning: projects.filter(p => p.status === 'planning').length,
                byPriority: {
                    high: projects.filter(p => p.priority === 'high').length,
                    medium: projects.filter(p => p.priority === 'medium').length,
                    low: projects.filter(p => p.priority === 'low').length
                }
            },
            collaboration: {
                totalUsers: users.length,
                clinicians: users.filter(u => u.role === 'clinician').length,
                industry: users.filter(u => u.role === 'industry').length,
                activeDiscussions: discussions.length,
                totalComments: discussions.reduce((sum, d) => sum + (d.comments?.length || 0), 0),
                totalVotes: discussions.reduce((sum, d) => sum + (d.upvotes || 0) + (d.downvotes || 0), 0),
                consensusRate: data.analytics.consensusRate || 0
            },
            topDiscussions: data.analytics.topDiscussions.map(id => {
                const d = data.discussions[id];
                return d ? {
                    title: d.title,
                    upvotes: d.upvotes || 0,
                    author: d.author,
                    projectId: d.projectId
                } : null;
            }).filter(Boolean)
        };
        
        res.json({ success: true, analytics });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// LOGIN ENDPOINT
app.post('/api/login', async (req, res) => {
    try {
        const { email, name, role, institution } = req.body;
        
        if (!name) {
            return res.status(400).json({ success: false, error: 'Name is required' });
        }
        
        const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
        
        // Generate user ID
        const userId = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        
        // Create or update user
        if (!data.users[userId]) {
            data.users[userId] = {
                id: userId,
                name,
                role: role || (name.includes('Dr.') ? 'clinician' : 'industry'),
                specialty: name.includes('Pulmon') ? 'Pulmonology' : 'General',
                institution: institution || "Unknown",
                email: email || "",
                projects: [],
                status: "active",
                createdAt: new Date().toISOString()
            };
        }
        
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        
        res.json({ 
            success: true, 
            message: 'Login successful',
            user: {
                id: userId,
                name: name,
                role: data.users[userId].role,
                institution: data.users[userId].institution
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET CURRENT USER
app.get('/api/user', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            return res.json({ 
                success: true, 
                user: {
                    name: "Anonymous User",
                    role: "guest",
                    institution: "Unknown"
                }
            });
        }
        
        const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
        const user = data.users[userId];
        
        if (!user) {
            return res.json({ 
                success: true, 
                user: {
                    name: "Anonymous User",
                    role: "guest",
                    institution: "Unknown"
                }
            });
        }
        
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/health', (req, res) => {
    res.json({ 
        status: '🏥 Platform Active',
        timestamp: new Date().toISOString(),
        features: ['voting', 'discussions', 'analytics', 'professional-profiles']
    });
});

// Serve login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

async function startServer() {
    try {
        await initData();
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`
🚀 MedCollab Platform Running!
📍 Port: ${PORT}
🔗 Local: http://localhost:${PORT}
🔗 Login: http://localhost:${PORT}/login

📊 Features:
• Professional voting system
• Clinical discussion highlights
• Real-time consensus tracking
• Pulmonology Department Innovation
• Secure clinician-industry collaboration
            `);
        });
    } catch (error) {
        console.error('Failed to start:', error);
    }
}

startServer();
