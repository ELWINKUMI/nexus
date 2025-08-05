'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Avatar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Breadcrumbs,
  Link,
  Paper,
  Stack,
  Badge,
  Tooltip,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  LinearProgress
} from '@mui/material';
import {
  Folder as ResourceIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  Link as LinkIcon,
  Archive as ZipIcon,
  Code as CodeIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Subject as SubjectIcon,
  Person as TeacherIcon,
  Public as PublicIcon,
  Lock as PrivateIcon,
  GetApp as GetAppIcon,
  Class as ClassIcon,
  Schedule as DateIcon,
  Info as InfoIcon,
  Star as StarIcon,
  TrendingDown as SizeIcon,
  AccessTime as RecentIcon,
  Image as ImageIcon,
  Movie as VideoIcon,
  Audiotrack as AudioIcon,
  InsertDriveFile as FileIcon,
  Archive as ArchiveIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface Resource {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  uploadedBy: {
    name: string;
    avatar?: string;
  };
  subject?: string;
  className?: string;
  uploadedAt: string;
  downloadCount: number;
  tags: string[];
  visibility: 'public' | 'private' | 'class' | 'subject';
  thumbnail?: string;
}

export default function StudentResourcesPage() {
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    filterAndSearchResources();
  }, [resources, filter, searchQuery, sortBy]);

  const loadResources = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/student/resources', {
        credentials: 'include'
      });

      if (response.ok) {
        const resourcesData = await response.json();
        // Map the API response to our Resource interface
        const mappedResources = resourcesData.map((resource: any) => ({
          id: resource.id,
          title: resource.title,
          description: resource.description,
          fileName: resource.fileName || resource.title,
          fileSize: resource.fileSize || 0,
          fileType: resource.type || resource.fileType,
          fileUrl: resource.url || resource.fileUrl,
          uploadedBy: {
            name: resource.uploadedBy?.name || resource.teacher || 'Unknown',
            avatar: resource.uploadedBy?.avatar
          },
          subject: resource.subject,
          className: resource.className || resource.class,
          uploadedAt: resource.createdAt || resource.uploadedAt,
          downloadCount: resource.downloadCount || 0,
          tags: resource.tags || [],
          visibility: resource.visibility || (resource.isPublic ? 'public' : 'class')
        }));
        setResources(mappedResources);
      } else if (response.status === 401) {
        router.push('/auth/login');
      } else {
        console.error('Failed to fetch resources:', response.statusText);
        setResources([]); // Set empty array instead of mock data
      }
    } catch (error) {
      console.error('Error loading resources:', error);
      setResources([]); // Set empty array instead of mock data
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSearchResources = () => {
    let filtered = resources;

    // Apply filter
    switch (filter) {
      case 'pdf':
        filtered = filtered.filter(r => r.fileType.includes('pdf'));
        break;
      case 'image':
        filtered = filtered.filter(r => r.fileType.startsWith('image/'));
        break;
      case 'video':
        filtered = filtered.filter(r => r.fileType.startsWith('video/'));
        break;
      case 'document':
        filtered = filtered.filter(r => 
          r.fileType.includes('document') || 
          r.fileType.includes('text') ||
          r.fileType.includes('presentation')
        );
        break;
      case 'archive':
        filtered = filtered.filter(r => r.fileType.includes('zip') || r.fileType.includes('rar'));
        break;
      case 'recent':
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filtered = filtered.filter(r => new Date(r.uploadedAt) > oneWeekAgo);
        break;
      default:
        // 'all' - no filtering
        break;
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.uploadedBy.name.toLowerCase().includes(query) ||
        r.subject?.toLowerCase().includes(query) ||
        r.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => b.downloadCount - a.downloadCount);
        break;
      case 'size-large':
        filtered.sort((a, b) => b.fileSize - a.fileSize);
        break;
      case 'size-small':
        filtered.sort((a, b) => a.fileSize - b.fileSize);
        break;
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'subject':
        filtered.sort((a, b) => (a.subject || '').localeCompare(b.subject || ''));
        break;
    }

    setFilteredResources(filtered);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <PdfIcon color="error" />;
    if (fileType.startsWith('image/')) return <ImageIcon color="success" />;
    if (fileType.startsWith('video/')) return <VideoIcon color="primary" />;
    if (fileType.startsWith('audio/')) return <AudioIcon color="warning" />;
    if (fileType.includes('document') || fileType.includes('text')) return <DocIcon color="info" />;
    if (fileType.includes('presentation')) return <DocIcon color="secondary" />;
    if (fileType.includes('zip') || fileType.includes('rar')) return <ArchiveIcon color="action" />;
    return <FileIcon color="action" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 3600);
    
    if (diffHours < 24) {
      return `${Math.round(diffHours)} hours ago`;
    } else if (diffHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const downloadResource = async (resource: Resource) => {
    try {
      // Track download
      setResources(prev => 
        prev.map(r => 
          r.id === resource.id 
            ? { ...r, downloadCount: r.downloadCount + 1 }
            : r
        )
      );

      // Trigger download
      const link = document.createElement('a');
      link.href = resource.fileUrl;
      link.download = resource.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading resource:', error);
    }
  };

  const previewResource = (resource: Resource) => {
    if (resource.fileType.startsWith('image/') || resource.fileType.includes('pdf')) {
      window.open(resource.fileUrl, '_blank');
    } else {
      setSelectedResource(resource);
      setResourceDialogOpen(true);
    }
  };

  const getResourceStats = () => {
    return {
      total: resources.length,
      pdf: resources.filter(r => r.fileType.includes('pdf')).length,
      images: resources.filter(r => r.fileType.startsWith('image/')).length,
      videos: resources.filter(r => r.fileType.startsWith('video/')).length,
      documents: resources.filter(r => 
        r.fileType.includes('document') || 
        r.fileType.includes('text') ||
        r.fileType.includes('presentation')
      ).length,
      totalSize: resources.reduce((acc, r) => acc + r.fileSize, 0),
      totalDownloads: resources.reduce((acc, r) => acc + r.downloadCount, 0)
    };
  };

  const stats = getResourceStats();

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
          Loading resources...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link href="/student" underline="hover">Dashboard</Link>
        <Typography color="text.primary">Resources</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom fontWeight="bold">
          📁 Study Resources
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Access learning materials, documents, and study guides
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <Card sx={{ textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
            <CardContent sx={{ py: 2 }}>
              <ResourceIcon sx={{ fontSize: 30, mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{stats.total}</Typography>
              <Typography variant="body2">Total Files</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <Card sx={{ textAlign: 'center', bgcolor: 'error.main', color: 'white' }}>
            <CardContent sx={{ py: 2 }}>
              <PdfIcon sx={{ fontSize: 30, mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{stats.pdf}</Typography>
              <Typography variant="body2">PDFs</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <Card sx={{ textAlign: 'center', bgcolor: 'success.main', color: 'white' }}>
            <CardContent sx={{ py: 2 }}>
              <ImageIcon sx={{ fontSize: 30, mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{stats.images}</Typography>
              <Typography variant="body2">Images</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <Card sx={{ textAlign: 'center', bgcolor: 'info.main', color: 'white' }}>
            <CardContent sx={{ py: 2 }}>
              <VideoIcon sx={{ fontSize: 30, mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{stats.videos}</Typography>
              <Typography variant="body2">Videos</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <Card sx={{ textAlign: 'center', bgcolor: 'warning.main', color: 'white' }}>
            <CardContent sx={{ py: 2 }}>
              <SizeIcon sx={{ fontSize: 30, mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{formatFileSize(stats.totalSize)}</Typography>
              <Typography variant="body2">Total Size</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <Card sx={{ textAlign: 'center', bgcolor: 'secondary.main', color: 'white' }}>
            <CardContent sx={{ py: 2 }}>
              <DownloadIcon sx={{ fontSize: 30, mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{stats.totalDownloads}</Typography>
              <Typography variant="body2">Downloads</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1 }}
            size="small"
          />
          
          <Button
            startIcon={<FilterIcon />}
            onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
            variant="outlined"
            size="small"
          >
            Filter: {filter === 'all' ? 'All Files' : filter}
          </Button>

          <Button
            startIcon={<SortIcon />}
            onClick={() => {
              const sortOptions = ['newest', 'oldest', 'popular', 'size-large', 'size-small', 'name', 'subject'];
              const currentIndex = sortOptions.indexOf(sortBy);
              const nextIndex = (currentIndex + 1) % sortOptions.length;
              setSortBy(sortOptions[nextIndex]);
            }}
            variant="outlined"
            size="small"
          >
            Sort: {sortBy.replace('-', ' ')}
          </Button>
        </Stack>

        <Menu
          anchorEl={filterMenuAnchor}
          open={Boolean(filterMenuAnchor)}
          onClose={() => setFilterMenuAnchor(null)}
        >
          {[
            { value: 'all', label: 'All Files', icon: <ResourceIcon /> },
            { value: 'pdf', label: 'PDF Documents', icon: <PdfIcon /> },
            { value: 'image', label: 'Images', icon: <ImageIcon /> },
            { value: 'video', label: 'Videos', icon: <VideoIcon /> },
            { value: 'document', label: 'Documents', icon: <DocIcon /> },
            { value: 'archive', label: 'Archives', icon: <ArchiveIcon /> },
            { value: 'recent', label: 'Recent (7 days)', icon: <RecentIcon /> }
          ].map((option) => (
            <MenuItem
              key={option.value}
              onClick={() => {
                setFilter(option.value);
                setFilterMenuAnchor(null);
              }}
              selected={filter === option.value}
            >
              <ListItemIcon>{option.icon}</ListItemIcon>
              <ListItemText>{option.label}</ListItemText>
            </MenuItem>
          ))}
        </Menu>
      </Paper>

      {/* Resources Grid */}
      <Grid container spacing={3}>
        {filteredResources.map((resource) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={resource.id}>
            <Card 
              sx={{ 
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6
                }
              }}
            >
              <CardContent>
                {/* Header */}
                <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {getFileIcon(resource.fileType)}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ lineHeight: 1.2 }}>
                      {resource.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {resource.description}
                    </Typography>
                  </Box>
                </Box>

                {/* File Details */}
                <Box sx={{ mb: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <Typography variant="body2" fontWeight="medium">
                      {resource.fileName}
                    </Typography>
                    <Chip label={formatFileSize(resource.fileSize)} size="small" variant="outlined" />
                  </Stack>
                  
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Avatar sx={{ width: 20, height: 20 }} src={resource.uploadedBy.avatar}>
                      {resource.uploadedBy.name.charAt(0)}
                    </Avatar>
                    <Typography variant="body2" color="text.secondary">
                      {resource.uploadedBy.name}
                    </Typography>
                    {resource.subject && (
                      <>
                        <Typography variant="body2" color="text.secondary">•</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {resource.subject}
                        </Typography>
                      </>
                    )}
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <DateIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(resource.uploadedAt)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">•</Typography>
                    <DownloadIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {resource.downloadCount} downloads
                    </Typography>
                  </Box>
                </Box>

                {/* Tags */}
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                  {resource.tags.slice(0, 3).map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                  {resource.tags.length > 3 && (
                    <Typography variant="caption" color="text.secondary">
                      +{resource.tags.length - 3} more
                    </Typography>
                  )}
                </Stack>

                {/* Progress Bar for File Size */}
                <Box sx={{ mb: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="caption" color="text.secondary">
                      File Size
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(resource.fileSize)}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min((resource.fileSize / 10485760) * 100, 100)} // Max 10MB for progress
                    sx={{ height: 4, borderRadius: 2 }}
                    color={resource.fileSize > 5242880 ? 'warning' : 'primary'}
                  />
                </Box>

                {/* Action Buttons */}
                <Stack direction="row" spacing={1}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={() => downloadResource(resource)}
                    size="small"
                  >
                    Download
                  </Button>
                  <Tooltip title="Preview">
                    <IconButton
                      onClick={() => previewResource(resource)}
                      color="primary"
                      size="small"
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Details">
                    <IconButton
                      onClick={() => {
                        setSelectedResource(resource);
                        setResourceDialogOpen(true);
                      }}
                      color="primary"
                      size="small"
                    >
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredResources.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ResourceIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No resources found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filter === 'all' 
              ? "No study resources are available yet."
              : `No ${filter} files found matching your criteria.`
            }
          </Typography>
        </Paper>
      )}

      {/* Resource Details Dialog */}
      <Dialog 
        open={resourceDialogOpen} 
        onClose={() => setResourceDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedResource && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {getFileIcon(selectedResource.fileType)}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedResource.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedResource.fileName} • {formatFileSize(selectedResource.fileSize)}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" paragraph>
                {selectedResource.description}
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon><TeacherIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Uploaded by" 
                    secondary={selectedResource.uploadedBy.name} 
                  />
                </ListItem>
                {selectedResource.subject && (
                  <ListItem>
                    <ListItemIcon><SubjectIcon /></ListItemIcon>
                    <ListItemText 
                      primary="Subject" 
                      secondary={selectedResource.subject} 
                    />
                  </ListItem>
                )}
                {selectedResource.className && (
                  <ListItem>
                    <ListItemIcon><ClassIcon /></ListItemIcon>
                    <ListItemText 
                      primary="Class" 
                      secondary={selectedResource.className} 
                    />
                  </ListItem>
                )}
                <ListItem>
                  <ListItemIcon><DateIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Upload Date" 
                    secondary={new Date(selectedResource.uploadedAt).toLocaleString()} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><DownloadIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Downloads" 
                    secondary={`${selectedResource.downloadCount} times`} 
                  />
                </ListItem>
              </List>

              {selectedResource.tags.length > 0 && (
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Tags:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {selectedResource.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                  </Stack>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setResourceDialogOpen(false)}>
                Close
              </Button>
              <Button 
                variant="outlined"
                startIcon={<ViewIcon />}
                onClick={() => previewResource(selectedResource)}
              >
                Preview
              </Button>
              <Button 
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => {
                  downloadResource(selectedResource);
                  setResourceDialogOpen(false);
                }}
              >
                Download
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
}
