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

// Generate unique IDs
function generateId(prefix = 'proj') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Initialize medical research data
async function initData() {
    try {
        await fs.access(DATA_FILE);
        console.log('📁 Research database loaded');
    } catch {
        console.log('📁 Creating medical research database...');
        
        const initialData = {
            // Core GSK Projects
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
                    budget: "$500,000",
                    milestones: [
                        { id: "m1", title: "Data Collection Complete", status: "completed", date: "2024-02-28" },
                        { id: "m2", title: "AI Model V1", status: "in-progress", date: "2024-04-15" },
                        { id: "m3", title: "Clinical Validation", status: "pending", date: "2024-08-30" }
                    ],
                    documents: [
                        { id: "d1", title: "Protocol v2.1", type: "protocol", url: "#", uploaded: "2024-01-20" },
                        { id: "d2", title: "Ethics Approval", type: "approval", url: "#", uploaded: "2024-01-25" }
                    ],
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
            
            // Research Discussions & Notes
            discussions: {
                "disc-001": {
                    id: "disc-001",
                    projectId: "gsk-copd-001",
                    title: "Defining Treatable Traits Criteria",
                    content: "Discussion about which traits should be considered 'treatable' in our model...",
                    author: "Dr. Baraka",
                    type: "clinical",
                    tags: ["criteria", "definition", "clinical"],
                    comments: [
                        { id: "c1", author: "clinician1", content: "Should we include eosinophil count?", date: "2024-01-16" },
                        { id: "c2", author: "researcher2", content: "Yes, plus FeNO levels", date: "2024-01-16" }
                    ],
                    createdAt: "2024-01-15"
                }
            },
            
            // Team Members
            members: {
                "dr-baraka": {
                    id: "dr-baraka",
                    name: "Dr. Baraka",
                    role: "Principal Investigator",
                    specialty: "Pulmonology",
                    institution: "University-Hospital",
                    email: "baraka@hospital.edu",
                    projects: ["gsk-copd-001"],
                    status: "active"
                },
                "clinician1": {
                    id: "clinician1",
                    name: "Dr. Jane Smith",
                    role: "Clinical Lead",
                    specialty: "Respiratory Medicine",
                    institution: "GSK",
                    email: "j.smith@gsk.com",
                    projects: ["gsk-copd-001"],
                    status: "active"
                }
            },
            
            // AI Models & Datasets
            models: {
                "model-001": {
                    id: "model-001",
                    name: "COPD Trait Classifier v1",
                    projectId: "gsk-copd-001",
                    type: "classification",
                    framework: "PyTorch",
                    accuracy: "0.89",
                    status: "training",
                    dataset: "copd-ehr-2024",
                    createdAt: "2024-02-01"
                }
            },
            
            // Platform Config
            config: {
                institution: "GSK Research Collaboration",
                theme: "medical",
                privacyLevel: "high",
                notificationSettings: {
                    emailAlerts: true,
                    milestoneUpdates: true,
                    discussionReplies: true
                }
            }
        };
        
        await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
        console.log('✅ Medical research database created');
    }
}

// ========== API ENDPOINTS ==========

// 1. Get all projects
app.get('/api/projects', async (req, res) => {
    try {
        const { status, tag, lead, institution } = req.query;
        const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
        
        let projects = Object.values(data.projects);
        
        // Filters for clinicians
        if (status) projects = projects.filter(p => p.status === status);
        if (tag) projects = projects.filter(p => p.tags?.includes(tag));
        if (lead) projects = projects.filter(p => p.lead === lead);
        if (institution) projects = projects.filter(p => p.institutions?.includes(institution));
        
        // Sort by priority and date
        projects.sort((a, b) => {
            const priorityOrder = { high: 1, medium: 2, low: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority] ||
                   new Date(b.updatedAt) - new Date(a.updatedAt);
        });
        
        res.json({ success: true, projects, count: projects.length });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2. Get single project with all details
app.get('/api/projects/:id', async (req, res) => {
    try {
        const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
        const project = data.projects[req.params.id];
        
        if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
        
        // Get related discussions
        const discussions = Object.values(data.discussions)
            .filter(d => d.projectId === req.params.id);
        
        // Get team details
        const teamDetails = project.team.map(memberId => data.members[memberId] || null);
        
        // Get related models
        const models = Object.values(data.models)
            .filter(m => m.projectId === req.params.id);
        
        res.json({
            success: true,
            project,
            discussions,
            team: teamDetails,
            models,
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

// 3. Create new project (for mini-projects within GSK package)
app.post('/api/projects', async (req, res) => {
    try {
        const { title, description, lead, tags, type } = req.body;
        
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
            tags: [...(tags || []), "GSK", type || "mini-project"],
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
        
        res.json({
            success: true,
            message: 'New project created successfully',
            project: newProject
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 4. Add team member to project
app.post('/api/projects/:id/team', async (req, res) => {
    try {
        const { memberId, role } = req.body;
        const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
        const project = data.projects[req.params.id];
        
        if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
        
        // Create member if doesn't exist
        if (!data.members[memberId]) {
            data.members[memberId] = {
                id: memberId,
                name: memberId,
                role: role || "Collaborator",
                specialty: "To be specified",
                institution: "GSK Partner",
                projects: [req.params.id],
                status: "active"
            };
        } else {
            // Add project to member's list
            if (!data.members[memberId].projects.includes(req.params.id)) {
                data.members[memberId].projects.push(req.params.id);
            }
        }
        
        // Add member to project
        if (!project.team.includes(memberId)) {
            project.team.push(memberId);
            project.updatedAt = new Date().toISOString();
        }
        
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        
        res.json({
            success: true,
            message: 'Team member added',
            team: project.team,
            member: data.members[memberId]
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 5. Create research discussion
app.post('/api/discussions', async (req, res) => {
    try {
        const { projectId, title, content, author, type, tags } = req.body;
        
        if (!projectId || !title || !content) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }
        
        const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
        const id = generateId('disc');
        
        const discussion = {
            id,
            projectId,
            title,
            content,
            author: author || "anonymous",
            type: type || "general",
            tags: tags || [],
            comments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        data.discussions[id] = discussion;
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        
        // Update project timestamp
        if (data.projects[projectId]) {
            data.projects[projectId].updatedAt = new Date().toISOString();
            await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        }
        
        res.json({
            success: true,
            message: 'Discussion created',
            discussion
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 6. Add comment to discussion
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
        discussion.updatedAt = new Date().toISOString();
        
        // Update project timestamp
        if (data.projects[discussion.projectId]) {
            data.projects[discussion.projectId].updatedAt = new Date().toISOString();
        }
        
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        
        res.json({
            success: true,
            message: 'Comment added',
            comment
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 7. Add milestone to project
app.post('/api/projects/:id/milestones', async (req, res) => {
    try {
        const { title, dueDate, assignee } = req.body;
        const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
        const project = data.projects[req.params.id];
        
        if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
        
        const milestone = {
            id: `m${(project.milestones?.length || 0) + 1}`,
            title,
            status: "pending",
            dueDate,
            assignee,
            createdAt: new Date().toISOString()
        };
        
        if (!project.milestones) project.milestones = [];
        project.milestones.push(milestone);
        project.updatedAt = new Date().toISOString();
        
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        
        res.json({
            success: true,
            message: 'Milestone added',
            milestone
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 8. Update milestone status
app.put('/api/projects/:projectId/milestones/:milestoneId', async (req, res) => {
    try {
        const { status, notes } = req.body;
        const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
        const project = data.projects[req.params.projectId];
        
        if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
        
        const milestone = project.milestones?.find(m => m.id === req.params.milestoneId);
        if (!milestone) return res.status(404).json({ success: false, error: 'Milestone not found' });
        
        milestone.status = status || milestone.status;
        milestone.notes = notes;
        milestone.updatedAt = new Date().toISOString();
        project.updatedAt = new Date().toISOString();
        
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        
        res.json({
            success: true,
            message: 'Milestone updated',
            milestone
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 9. Get platform analytics
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
                planning: projects.filter(p => p.status === 'planning').length,
                completed: projects.filter(p => p.status === 'completed').length,
                byPhase: {
                    phase1: projects.filter(p => p.phase === 'Phase 1').length,
                    phase2: projects.filter(p => p.phase === 'Phase 2').length,
                    phase3: projects.filter(p => p.phase === 'Phase 3').length
                }
            },
            collaboration: {
                totalMembers: members.length,
                activeDiscussions: discussions.length,
                totalComments: discussions.reduce((sum, d) => sum + (d.comments?.length || 0), 0),
                institutions: [...new Set(members.map(m => m.institution))]
            },
            timeline: {
                recentProjects: projects
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 5)
                    .map(p => ({ id: p.id, title: p.title, status: p.status })),
                upcomingMilestones: projects
                    .flatMap(p => p.milestones?.map(m => ({ ...m, projectId: p.id, projectTitle: p.title })) || [])
                    .filter(m => m.status === 'pending')
                    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                    .slice(0, 5)
            }
        };
        
        res.json({ success: true, analytics });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 10. Search across everything
app.get('/api/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json({ success: true, results: [] });
        
        const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
        const query = q.toLowerCase();
        
        const results = {
            projects: Object.values(data.projects).filter(p => 
                p.title.toLowerCase().includes(query) || 
                p.description.toLowerCase().includes(query) ||
                p.tags?.some(tag => tag.toLowerCase().includes(query))
            ),
            discussions: Object.values(data.discussions).filter(d => 
                d.title.toLowerCase().includes(query) || 
                d.content.toLowerCase().includes(query)
            ),
            members: Object.values(data.members).filter(m => 
                m.name.toLowerCase().includes(query) || 
                m.specialty.toLowerCase().includes(query)
            )
        };
        
        res.json({ success: true, query, results });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 11. Health check
app.get('/health', (req, res) => {
    res.json({
        status: '🏥 Medical Collaboration Platform Active',
        service: 'GSK Research Collaboration',
        timestamp: new Date().toISOString(),
        endpoints: [
            '/api/projects',
            '/api/discussions', 
            '/api/analytics',
            '/api/search'
        ]
    });
});

// Initialize and start
await initData();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🏥 MedCollab AI Platform running on port ${PORT}`);
    console.log(`🔬 GSK Projects: ${Object.keys(JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')).projects).length}`);
    console.log(`👨‍⚕️ Team Members: ${Object.keys(JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')).members).length}`);
});
