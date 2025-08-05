'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Add as AddIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  AccountCircle,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface School {
  id: string;
  name: string;
  createdAt: string;
  admin: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface NewSchoolData {
  schoolName: string;
  adminName: string;
  adminEmail: string;
}

interface CreatedSchool {
  id: string;
  name: string;
  admin: {
    id: string;
    pin: string;
    name: string;
    email: string;
  };
}

export default function SuperAdminDashboard() {
  const [schools, setSchools] = useState<School[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createdSchool, setCreatedSchool] = useState<CreatedSchool | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const [formData, setFormData] = useState<NewSchoolData>({
    schoolName: '',
    adminName: '',
    adminEmail: '',
  });

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'superAdmin') {
      router.push('/login');
      return;
    }

    setUser(parsedUser);
    fetchSchools();
  }, [router]);

  const fetchSchools = async () => {
    try {
      const response = await fetch('/api/super-admin/schools');
      if (response.ok) {
        const data = await response.json();
        setSchools(data.schools);
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setCreatedSchool(null);

    try {
      const response = await fetch('/api/super-admin/schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setCreatedSchool(data);
        setSuccess('School and admin created successfully!');
        setFormData({ schoolName: '', adminName: '', adminEmail: '' });
        fetchSchools();
      } else {
        setError(data.error || 'Failed to create school');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('user');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('user');
      router.push('/login');
    }
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setCreatedSchool(null);
    setError('');
    setSuccess('');
  };

  if (!user) {
    return null; // Loading or redirecting
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      bgcolor: '#f5f7fa'
    }}>
      {/* Sidebar */}
      <Box sx={{
        width: 280,
        bgcolor: '#1e3a8a',
        color: 'white',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto',
        boxShadow: '4px 0 10px rgba(0,0,0,0.1)'
      }}>
        {/* Logo Section */}
        <Box sx={{ 
          p: 3, 
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <SchoolIcon sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              NEXUS LMS
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Super Administrator
            </Typography>
          </Box>
        </Box>

        {/* User Info */}
        <Box sx={{ 
          p: 3, 
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          bgcolor: 'rgba(255,255,255,0.05)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <AccountCircle sx={{ fontSize: 48 }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {user?.name}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Super Administrator
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', opacity: 0.7 }}>
                ID: {user?.id}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Navigation */}
        <Box sx={{ p: 2 }}>
          <Typography variant="overline" sx={{ 
            color: 'rgba(255,255,255,0.6)', 
            fontSize: '0.75rem',
            fontWeight: 'bold',
            letterSpacing: 1,
            px: 2,
            py: 1,
            display: 'block'
          }}>
            SYSTEM MANAGEMENT
          </Typography>
          
          <List sx={{ p: 0 }}>
            <ListItem
              sx={{
                mx: 1,
                mb: 1,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.15)',
                transition: 'all 0.2s ease'
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                <SchoolIcon />
              </ListItemIcon>
              <ListItemText 
                primary="School Management"
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: 'bold'
                }}
              />
            </ListItem>
          </List>

          <Box sx={{ mt: 4, px: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.3)',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ 
        flex: 1, 
        ml: '280px',
        minHeight: '100vh'
      }}>
        {/* Header */}
        <Box sx={{
          bgcolor: 'white',
          borderBottom: '1px solid #e2e8f0',
          px: 4,
          py: 3,
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 'bold',
            color: '#1e293b',
            mb: 1
          }}>
            System Administration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage schools and administrators across the NEXUS platform
          </Typography>
        </Box>

        {/* Content Area */}
        <Box sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} lg={3}>
              <Card sx={{ 
                p: 3,
                height: '100%',
                border: '1px solid #e2e8f0',
                borderRadius: 3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" sx={{ 
                      fontWeight: 'bold',
                      color: '#3b82f6',
                      mb: 1
                    }}>
                      {schools.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Total Schools
                    </Typography>
                  </Box>
                  <Box sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: '#eff6ff',
                    color: '#3b82f6'
                  }}>
                    <SchoolIcon />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card sx={{ 
                p: 3,
                height: '100%',
                border: '1px solid #e2e8f0',
                borderRadius: 3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" sx={{ 
                      fontWeight: 'bold',
                      color: '#10b981',
                      mb: 1
                    }}>
                      {schools.filter(s => s.admin).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Active Admins
                    </Typography>
                  </Box>
                  <Box sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: '#ecfdf5',
                    color: '#10b981'
                  }}>
                    <PersonIcon />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={6}>
              <Card sx={{ 
                p: 3,
                height: '100%',
                border: '1px solid #e2e8f0',
                borderRadius: 3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 'bold',
                      color: '#1e293b',
                      mb: 1
                    }}>
                      Quick Actions
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Create and manage schools
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setOpen(true)}
                      sx={{
                        bgcolor: '#1e3a8a',
                        borderRadius: 2,
                        px: 3,
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 'bold',
                        '&:hover': {
                          bgcolor: '#1e40af'
                        }
                      }}
                    >
                      Create New School
                    </Button>
                  </Box>
                  <Box sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: '#f1f5f9',
                    color: '#1e3a8a'
                  }}>
                    <AddIcon sx={{ fontSize: 40 }} />
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>

          {/* Schools Management */}
          <Card sx={{ 
            borderRadius: 3,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <Box sx={{ p: 4 }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 4,
                pb: 3,
                borderBottom: '1px solid #e2e8f0'
              }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b', mb: 1 }}>
                    Schools Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    All registered schools and their administrators
                  </Typography>
                </Box>
              </Box>

              {schools.length === 0 ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 8,
                  color: 'text.secondary'
                }}>
                  <SchoolIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    No schools created yet
                  </Typography>
                  <Typography variant="body2">
                    Create your first school to get started
                  </Typography>
                </Box>
              ) : (
                <TableContainer sx={{ 
                  border: '1px solid #e2e8f0',
                  borderRadius: 2,
                  overflow: 'hidden'
                }}>
                  <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>School Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Admin Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Admin ID</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Admin Email</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Created Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {schools.map((school) => (
                        <TableRow key={school.id} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                          <TableCell>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {school.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {school.admin?.name || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={school.admin?.id || 'N/A'}
                              size="small"
                              variant="outlined"
                              color="primary"
                            />
                          </TableCell>
                          <TableCell>
                            {school.admin?.email || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(school.createdAt).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Card>
        </Box>
      </Box>

      {/* Create School Dialog */}
      <Dialog 
        open={open} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 25px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid #e2e8f0',
          pb: 2,
          mb: 0
        }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
            Create New School
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Fill in the details below to create a new school
          </Typography>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            {createdSchool && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  School Admin Credentials:
                </Typography>
                <Typography variant="body2">
                  <strong>ID:</strong> {createdSchool.admin.id}
                </Typography>
                <Typography variant="body2">
                  <strong>PIN:</strong> {createdSchool.admin.pin}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Please save these credentials securely. The PIN will not be shown again.
                </Typography>
              </Alert>
            )}

            <TextField
              fullWidth
              label="School Name"
              value={formData.schoolName}
              onChange={(e) => setFormData(prev => ({ ...prev, schoolName: e.target.value }))}
              margin="normal"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />

            <TextField
              fullWidth
              label="Admin Name"
              value={formData.adminName}
              onChange={(e) => setFormData(prev => ({ ...prev, adminName: e.target.value }))}
              margin="normal"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />

            <TextField
              fullWidth
              label="Admin Email"
              type="email"
              value={formData.adminEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, adminEmail: e.target.value }))}
              margin="normal"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ 
            borderTop: '1px solid #e2e8f0',
            p: 3,
            gap: 2
          }}>
            <Button 
              onClick={handleCloseDialog}
              sx={{
                textTransform: 'none',
                fontWeight: 'bold',
                px: 3,
                py: 1.5,
                borderRadius: 2
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
              sx={{
                textTransform: 'none',
                fontWeight: 'bold',
                px: 3,
                py: 1.5,
                borderRadius: 2,
                bgcolor: '#1e3a8a',
                '&:hover': {
                  bgcolor: '#1e40af'
                }
              }}
            >
              {loading ? 'Creating...' : 'Create School'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
