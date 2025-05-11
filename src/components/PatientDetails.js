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
  Tabs,
  Tab,
  Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const PatientDetails = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const response = await fetch(`/api/patients/${patientId}`);
        const data = await response.json();
        setPatient(data);
      } catch (error) {
        console.error('Error fetching patient details:', error);
      }
    };

    const fetchMedicalRecords = async () => {
      try {
        const response = await fetch(`/api/patients/${patientId}/medical-records`);
        const data = await response.json();
        setMedicalRecords(data);
      } catch (error) {
        console.error('Error fetching medical records:', error);
      }
    };

    const fetchVitals = async () => {
      try {
        const response = await fetch(`/api/patients/${patientId}/vitals`);
        const data = await response.json();
        setVitals(data);
      } catch (error) {
        console.error('Error fetching vitals:', error);
      }
    };

    fetchPatientDetails();
    fetchMedicalRecords();
    fetchVitals();
  }, [patientId]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (!patient) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <StyledPaper>
            <Typography variant="h4" gutterBottom>
              Patient Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">
                  <strong>Name:</strong> {patient.full_name}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Patient ID:</strong> {patient.patient_id}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Date of Birth:</strong> {new Date(patient.date_of_birth).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">
                  <strong>Gender:</strong> {patient.gender}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Contact:</strong> {patient.contact_number}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Address:</strong> {patient.address}
                </Typography>
              </Grid>
            </Grid>
          </StyledPaper>
        </Grid>

        <Grid item xs={12}>
          <StyledPaper>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Medical Records" />
                <Tab label="Vitals History" />
              </Tabs>
            </Box>

            {tabValue === 0 && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Diagnosis</TableCell>
                      <TableCell>Treatment Plan</TableCell>
                      <TableCell>Medications</TableCell>
                      <TableCell>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {medicalRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{new Date(record.record_date).toLocaleDateString()}</TableCell>
                        <TableCell>{record.diagnosis}</TableCell>
                        <TableCell>{record.treatment_plan}</TableCell>
                        <TableCell>{record.medications}</TableCell>
                        <TableCell>{record.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {tabValue === 1 && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Blood Pressure</TableCell>
                      <TableCell>Heart Rate</TableCell>
                      <TableCell>Temperature</TableCell>
                      <TableCell>Weight</TableCell>
                      <TableCell>Height</TableCell>
                      <TableCell>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {vitals.map((vital) => (
                      <TableRow key={vital.id}>
                        <TableCell>{new Date(vital.record_date).toLocaleDateString()}</TableCell>
                        <TableCell>{vital.blood_pressure}</TableCell>
                        <TableCell>{vital.heart_rate}</TableCell>
                        <TableCell>{vital.temperature}°C</TableCell>
                        <TableCell>{vital.weight} kg</TableCell>
                        <TableCell>{vital.height} cm</TableCell>
                        <TableCell>{vital.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </StyledPaper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PatientDetails; 