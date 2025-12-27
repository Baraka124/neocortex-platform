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
        console.log('📁 Creating medical research database...');
        
        const initialData = {
            projects: {
                "gsk-copd-001": {
                    id: "gsk-copd-001",
                    title: "AI-Driven Treatable Traits in COPD",
                    description: "Machine learning identification of treatable traits in COPD patients for personalized intervention",
                    status: "active",
                    phase: "Phase 2",
                    priority: "high",
                    tags: ["COPD", "AI", "Treatable-Traits", "GSK", "Clinical"],
                    lead: "Dr. Baraka",
                    team: ["clinician1", "researcher2", "data-scientist3"],
                    institutions: ["GSK", "University-Hospital"],
                    startDate: "2024-01-15",
                    endDate: "2024-12-31",
                    milestones: [
                        { id: "m1", title: "Data Collection Complete", status: "completed", date: "2024-02-28" },
                        { id: "m2", title: "AI Model V1", status: "in-progress", date: "2024-04-15" },
                        { id: "m3", title: "Clinical Validation", status: "pending", date: "2024-08-30" }
                    ],
                    documents: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                "gsk-asthma-002": {
                    id: "gsk-asthma-002",
                    title: "Asthma Exacerbation Prediction Model",
                    description: "Deep learning model to predict asthma exacerbations using EHR data",
                    status: "planning",
                    phase: "Phase 1",
                    priority: "medium",
                    tags: ["Asthma", "Prediction", "Deep-Learning", "GSK", "EHR"],
                    lead: "Dr. Smith",
                    team: [],
                    institutions: ["GSK"],
                    startDate: "2024-03-01",
                    endDate: "2024-11-30",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            },
            
            discussions: {
                "disc-001": {
                    id: "disc-001",
                    projectId: "gsk-copd-001",
                    title: "Defining Treatable Traits Criteria",
                    content: "Which traits should be considered 'treatable' in our AI model? Need clinical input.",
                    author: "Dr. Baraka",
                    type: "clinical",
                    tags: ["criteria", "definition"],
                    comments: [
                        { id: "c1", author: "clinician1", content: "Should include eosinophil count", date: "2024-01-16" }
                    ],
                    createdAt: new Date().toISOString()
                }
            },
            
            members: {
                "dr-baraka": {
                    id: "dr-baraka",
                    name: "Dr. Baraka",
                    role: "Principal Investigator",
                    specialty: "Pulmonology",
                    institution: "University-Hospital",
                    projects: ["gsk-copd-001"],
                    status: "active"
                }
            },
            
            config: {
                institution: "GSK Research Collaboration",
                theme: "medical",
                privacyLevel: "high"
            }
        };
        
        await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
        console.log('✅ Medical research database created');
        return true;
    }
}

// API ENDPOINTS
app.get('/api/projects', async (req, res) => {
    try {
        const { status, tag, lead } = req.query;
        const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
        
        let projects = Object.values(data.projects);
        
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
            .filter(d => d.projectId === req.params.id);
        
        const teamDetails = project.team.map(memberId => data.members[memberId] || null);
        
        res.json({
            success: true,
            project,
            discussions,
            team: teamDetails,
            analytics: {
                discussionCount: discussions.length,
                teamSize: project.team.length,
                milestoneProgress: project.milestones?.filter(m => m.status === 'completed').length || 0
            }
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
            updatedAt: new Date().toISOString()
        };
        
        data.projects[id] = newProject;
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        
        res.json({ success: true, message: 'Project created', project: newProject });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/discussions', async (req, res) => {
    try {
        const { projectId, title, content, author } = req.body;
        
        if (!projectId || !title || !content) {
            return res.status(400).json({ success: false, error: 'Missing fields' });
        }
        
        const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
        const id = generateId('disc');
        
        const discussion = {
            id,
            projectId,
            title,
            content,
            author: author || "anonymous",
            comments: [],
            createdAt: new Date().toISOString()
        };
        
        data.discussions[id] = discussion;
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        
        res.json({ success: true, message: 'Discussion created', discussion });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/discussions', async (req, res) => {
    try {
        const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
        const discussions = Object.values(data.discussions);
        
        discussions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        res.json({ success: true, discussions });
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
        
        discussion.comments.push(comment);
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        
        res.json({ success: true, message: 'Comment added', comment });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/analytics', async (req, res) => {
    try {
        const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
        const projects = Object.values(data.projects);
        const discussions = Object.values(data.discussions);
        const members = Object.values(data.members);
        
        const analytics = {
            projects: {
                total: projects.length,
                active: projects.filter(p => p.status === 'active').length,
                planning: projects.filter(p => p.status === 'planning').length
            },
            collaboration: {
                totalMembers: members.length,
                activeDiscussions: discussions.length
            }
        };
        
        res.json({ success: true, analytics });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/health', (req, res) => {
    res.json({ 
        status: '🏥 Platform Active',
        timestamp: new Date().toISOString()
    });
});

async function startServer() {
    try {
        await initData();
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`🚀 Platform running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start:', error);
    }
}

startServer();
