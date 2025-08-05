'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Breadcrumbs,
  Link,
  Snackbar,
  CircularProgress,
  Avatar,
  Tooltip,
  Badge,
  Fab,
  LinearProgress,
  CardMedia,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Menu,
  MenuList,
  MenuItem as MenuListItem
} from '@mui/material';
import {
  Add as AddIcon,
  Upload as UploadIcon,
  Folder as FolderIcon,
  Description as DocumentIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  AudioFile as AudioIcon,
  InsertDriveFile as FileIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  CloudUpload as CloudUploadIcon,
  Storage as StorageIcon,
  Class as ClassIcon,
  Subject as SubjectIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  GetApp as GetAppIcon,
  OpenInNew as OpenInNewIcon,
  Cancel as CancelIcon,
  Save as SaveIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface Resource {
  _id: string;
  title: string;
  description: string;
  filename: string;
  originalName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  classId?: string;
  className?: string;
  subjectId?: string;
  subjectName?: string;
  visibility: 'public' | 'class' | 'subject';
  downloadCount: number;
  uploadedBy: string;
  uploadedAt: Date;
  tags: string[];
}

interface Class {
  id: string;
  name: string;
  studentCount: number;
}

interface Subject {
  _id: string;
  name: string;
  classCount: number;
}

export default function ResourcesPage() {
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classId: '',
    subjectId: '',
    visibility: 'public' as 'public' | 'class' | 'subject',
    tags: [] as string[]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [resourcesRes, classesRes, subjectsRes] = await Promise.all([
        fetch('/api/teacher/resources', { credentials: 'include' }),
        fetch('/api/teacher/classes', { credentials: 'include' }),
        fetch('/api/teacher/subjects', { credentials: 'include' })
      ]);

      if (resourcesRes.ok) {
        const resourcesData = await resourcesRes.json();
        setResources(resourcesData);
      }

      if (classesRes.ok) {
        const classesData = await classesRes.json();
        setClasses(classesData);
      }

      if (subjectsRes.ok) {
        const subjectsData = await subjectsRes.json();
        setSubjects(subjectsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setSnackbar({
        open: true,
        message: 'Error loading data. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFormData({
        ...formData,
        title: formData.title || file.name.split('.')[0]
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setSnackbar({
        open: true,
        message: 'Please select a file to upload',
        severity: 'error'
      });
      return;
    }

    if (!formData.title) {
      setSnackbar({
        open: true,
        message: 'Please provide a title for the resource',
        severity: 'error'
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile);
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('classId', formData.classId);
      uploadFormData.append('subjectId', formData.subjectId);
      uploadFormData.append('visibility', formData.visibility);
      uploadFormData.append('tags', JSON.stringify(formData.tags));

      const response = await fetch('/api/teacher/resources', {
        method: 'POST',
        credentials: 'include',
        body: uploadFormData
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Resource uploaded successfully!',
          severity: 'success'
        });
        setUploadDialogOpen(false);
        resetForm();
        fetchData();
      } else {
        const error = await response.json();
        setSnackbar({
          open: true,
          message: error.error || 'Failed to upload resource',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error uploading resource:', error);
      setSnackbar({
        open: true,
        message: 'Network error. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (resourceId: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const response = await fetch(`/api/teacher/resources/${resourceId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Resource deleted successfully!',
          severity: 'success'
        });
        fetchData();
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to delete resource',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
      setSnackbar({
        open: true,
        message: 'Network error. Please try again.',
        severity: 'error'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      classId: '',
      subjectId: '',
      visibility: 'public',
      tags: []
    });
    setSelectedFile(null);
    setEditingResource(null);
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon />;
    if (mimeType.startsWith('video/')) return <VideoIcon />;
    if (mimeType.startsWith('audio/')) return <AudioIcon />;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return <DocumentIcon />;
    return <FileIcon />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredResources = resources
    .filter(resource => {
      if (searchTerm) {
        return resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
               resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
               resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      }
      return true;
    })
    .filter(resource => {
      if (filterBy === 'all') return true;
      if (filterBy === 'images') return resource.mimeType.startsWith('image/');
      if (filterBy === 'videos') return resource.mimeType.startsWith('video/');
      if (filterBy === 'documents') return resource.mimeType.includes('pdf') || resource.mimeType.includes('document');
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      if (sortBy === 'oldest') return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      if (sortBy === 'downloads') return b.downloadCount - a.downloadCount;
      if (sortBy === 'size') return b.fileSize - a.fileSize;
      return 0;
    });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link href="/teacher" underline="hover">Dashboard</Link>
        <Typography color="text.primary">Resources</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            <FolderIcon sx={{ mr: 2, verticalAlign: 'middle', fontSize: 40 }} />
            Resource Library
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Upload and manage educational resources for your students
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<UploadIcon />}
          onClick={() => setUploadDialogOpen(true)}
          sx={{
            bgcolor: '#f59e0b',
            '&:hover': { bgcolor: '#d97706' },
            borderRadius: 2,
            px: 3,
            py: 1.5
          }}
        >
          Upload Resource
        </Button>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card sx={{ p: 2, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {resources.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Resources
                </Typography>
              </Box>
              <StorageIcon sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card sx={{ p: 2, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {resources.reduce((sum, r) => sum + r.downloadCount, 0)}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Downloads
                </Typography>
              </Box>
              <DownloadIcon sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card sx={{ p: 2, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {resources.filter(r => r.mimeType.startsWith('image/')).length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Images
                </Typography>
              </Box>
              <ImageIcon sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card sx={{ p: 2, background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {resources.filter(r => r.mimeType.includes('pdf') || r.mimeType.includes('document')).length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Documents
                </Typography>
              </Box>
              <DocumentIcon sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </Card>
        </Box>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
              <TextField
                fullWidth
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                }}
              />
            </Box>
            <Box sx={{ flex: '0 1 150px', minWidth: 150 }}>
              <FormControl fullWidth>
                <InputLabel>Filter by Type</InputLabel>
                <Select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  label="Filter by Type"
                  startAdornment={<FilterListIcon sx={{ mr: 1 }} />}
                >
                  <MenuItem value="all">All Files</MenuItem>
                  <MenuItem value="images">Images</MenuItem>
                  <MenuItem value="videos">Videos</MenuItem>
                  <MenuItem value="documents">Documents</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '0 1 150px', minWidth: 150 }}>
              <FormControl fullWidth>
                <InputLabel>Sort by</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort by"
                  startAdornment={<SortIcon sx={{ mr: 1 }} />}
                >
                  <MenuItem value="newest">Newest First</MenuItem>
                  <MenuItem value="oldest">Oldest First</MenuItem>
                  <MenuItem value="name">Name A-Z</MenuItem>
                  <MenuItem value="downloads">Most Downloaded</MenuItem>
                  <MenuItem value="size">Largest First</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '0 1 200px', minWidth: 200, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Chip
                label={`${filteredResources.length} resources`}
                color="primary"
                variant="outlined"
              />
              {searchTerm && (
                <Chip
                  label={`"${searchTerm}"`}
                  onDelete={() => setSearchTerm('')}
                  color="secondary"
                />
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Resources Grid */}
      <Card>
        <CardContent>
          {filteredResources.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CloudUploadIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {searchTerm || filterBy !== 'all' ? 'No resources found' : 'No resources uploaded yet'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {searchTerm || filterBy !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'Upload your first resource to start building your library.'}
              </Typography>
              {!searchTerm && filterBy === 'all' && (
                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  onClick={() => setUploadDialogOpen(true)}
                  sx={{ bgcolor: '#f59e0b', '&:hover': { bgcolor: '#d97706' } }}
                >
                  Upload First Resource
                </Button>
              )}
            </Box>
          ) : (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 3 
            }}>
              {filteredResources.map((resource) => (
                <Card 
                  key={resource._id}
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    '&:hover': { boxShadow: 6 },
                    transition: 'box-shadow 0.3s ease'
                  }}
                >
                    {/* File Preview */}
                    <Box
                      sx={{
                        height: 120,
                        bgcolor: '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                      }}
                    >
                      {resource.mimeType.startsWith('image/') ? (
                        <CardMedia
                          component="img"
                          height="120"
                          image={resource.fileUrl}
                          alt={resource.title}
                          sx={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <Box sx={{ textAlign: 'center' }}>
                          {getFileIcon(resource.mimeType)}
                          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            {resource.fileType.toUpperCase()}
                          </Typography>
                        </Box>
                      )}
                      
                      {/* Action Menu */}
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setAnchorEl(e.currentTarget);
                          setSelectedResource(resource);
                        }}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: 'rgba(255,255,255,0.9)',
                          '&:hover': { bgcolor: 'white' }
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>

                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                      <Typography variant="h6" gutterBottom noWrap sx={{ fontSize: '1rem' }}>
                        {resource.title}
                      </Typography>
                      
                      {resource.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 40, overflow: 'hidden' }}>
                          {resource.description.length > 80 
                            ? `${resource.description.substring(0, 80)}...` 
                            : resource.description}
                        </Typography>
                      )}

                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        {resource.className && (
                          <Chip
                            icon={<ClassIcon />}
                            label={resource.className}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        )}
                        {resource.subjectName && (
                          <Chip
                            icon={<SubjectIcon />}
                            label={resource.subjectName}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(resource.fileSize)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {resource.downloadCount} downloads
                        </Typography>
                      </Box>
                      
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                        {formatDate(resource.uploadedAt)}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
          )}
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuListItem
          onClick={() => {
            if (selectedResource) {
              window.open(selectedResource.fileUrl, '_blank');
            }
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <OpenInNewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Open</ListItemText>
        </MenuListItem>
        <MenuListItem
          onClick={() => {
            if (selectedResource) {
              const a = document.createElement('a');
              a.href = selectedResource.fileUrl;
              a.download = selectedResource.originalName;
              a.click();
            }
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <GetAppIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuListItem>
        <MenuListItem
          onClick={() => {
            // Edit functionality would go here
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuListItem>
        <Divider />
        <MenuListItem
          onClick={() => {
            if (selectedResource) {
              handleDelete(selectedResource._id);
            }
            setAnchorEl(null);
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuListItem>
      </Menu>

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <UploadIcon sx={{ color: '#f59e0b' }} />
            <Typography variant="h6">
              Upload New Resource
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* File Upload Area */}
            <Box
              sx={{
                border: '2px dashed #d1d5db',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                bgcolor: '#f9fafb',
                cursor: 'pointer',
                '&:hover': { bgcolor: '#f3f4f6' }
              }}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input
                id="file-upload"
                type="file"
                accept="*/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <CloudUploadIcon sx={{ fontSize: 48, color: '#9ca3af', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {selectedFile ? selectedFile.name : 'Click to select a file'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedFile 
                  ? `${formatFileSize(selectedFile.size)} - ${selectedFile.type}`
                  : 'Supports all file types up to 100MB'}
              </Typography>
            </Box>

            <TextField
              fullWidth
              label="Resource Title *"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter a descriptive title"
              required
            />
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this resource is about..."
            />

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
                <FormControl fullWidth>
                  <InputLabel>Class (Optional)</InputLabel>
                  <Select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    label="Class (Optional)"
                  >
                    <MenuItem value="">
                      <em>All Classes</em>
                    </MenuItem>
                    {classes.map((cls) => (
                      <MenuItem key={cls.id} value={cls.id}>
                        {cls.name} ({cls.studentCount} students)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
                <FormControl fullWidth>
                  <InputLabel>Subject (Optional)</InputLabel>
                  <Select
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    label="Subject (Optional)"
                  >
                    <MenuItem value="">
                      <em>General Resource</em>
                    </MenuItem>
                    {subjects.map((subject) => (
                      <MenuItem key={subject._id} value={subject._id}>
                        {subject.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <FormControl fullWidth>
              <InputLabel>Visibility</InputLabel>
              <Select
                value={formData.visibility}
                onChange={(e) => setFormData({ ...formData, visibility: e.target.value as any })}
                label="Visibility"
              >
                <MenuItem value="public">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PublicIcon />
                    Public - All students can access
                  </Box>
                </MenuItem>
                <MenuItem value="class">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ClassIcon />
                    Class Only - Selected class members
                  </Box>
                </MenuItem>
                <MenuItem value="subject">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SubjectIcon />
                    Subject Only - Subject students
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            {isUploading && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Uploading... {uploadProgress}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={uploadProgress}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={() => {
              setUploadDialogOpen(false);
              resetForm();
            }}
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={isUploading || !selectedFile || !formData.title}
            startIcon={isUploading ? <CircularProgress size={16} /> : <UploadIcon />}
            variant="contained"
            sx={{ bgcolor: '#f59e0b', '&:hover': { bgcolor: '#d97706' } }}
          >
            {isUploading ? 'Uploading...' : 'Upload Resource'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="upload resource"
        onClick={() => setUploadDialogOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          bgcolor: '#f59e0b',
          '&:hover': { bgcolor: '#d97706' }
        }}
      >
        <UploadIcon />
      </Fab>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}
