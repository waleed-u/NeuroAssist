import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  backgroundColor:
    status === 'pending'
      ? theme.palette.warning.light
      : status === 'processed'
      ? theme.palette.info.light
      : theme.palette.success.light,
  color: theme.palette.common.white,
}));

const EEGHistory = () => {
  const { patientId } = useParams();
  const [eegRecords, setEegRecords] = useState([]);

  useEffect(() => {
    const fetchEEGHistory = async () => {
      try {
        const response = await fetch(`/api/patients/${patientId}/eeg-history`);
        const data = await response.json();
        setEegRecords(data);
      } catch (error) {
        console.error('Error fetching EEG history:', error);
      }
    };

    fetchEEGHistory();
  }, [patientId]);

  const handleViewAnalysis = (recordId) => {
    // Navigate to analysis details page
    window.location.href = `/analysis/${recordId}`;
  };

  const handleDownloadEEG = (filePath) => {
    // Implement file download logic
    window.open(`/api/eeg/download/${filePath}`, '_blank');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <StyledPaper>
            <Typography variant="h4" gutterBottom>
              EEG History
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Analysis Type</TableCell>
                    <TableCell>Findings</TableCell>
                    <TableCell>Recommendations</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {eegRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {new Date(record.upload_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <StatusChip
                          label={record.status}
                          status={record.status}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{record.analysis_type}</TableCell>
                      <TableCell>{record.findings}</TableCell>
                      <TableCell>{record.recommendations}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleViewAnalysis(record.id)}
                          sx={{ mr: 1 }}
                        >
                          View Analysis
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleDownloadEEG(record.file_path)}
                        >
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </StyledPaper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EEGHistory; 