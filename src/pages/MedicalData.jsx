import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import ChatWidget from '../components/ChatWidget';
import { getLabExplanation } from '../utils/openaiService';
import medicalDataStyles from '../styles/medicalDataStyles';

function getSummaryColor(summary) {
  if (summary === 'High') return 'error';
  if (summary === 'Low') return 'warning';
  if (summary === 'Normal') return 'success';
  return 'default';
}

function LabCard({ observation, setChatOpen, setSelectedObservation }) {
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function handleExpand() {
    setExpanded(!expanded);
    if (!expanded && !explanation) {
      setLoading(true);
      const result = await getLabExplanation(observation.title, observation.details);
      setExplanation(result);
      setLoading(false);
    }
  }

  return (
    <Box onClick={handleExpand} sx={medicalDataStyles.labCard}>
      <Box sx={medicalDataStyles.labCardHeader}>
        <Typography sx={medicalDataStyles.labCardHeaderTitle}>
          {observation.title}
        </Typography>
        <Box sx={medicalDataStyles.labCardHeaderRight}>
          {observation.summary !== 'Recorded' && (
            <Chip label={observation.summary} color={getSummaryColor(observation.summary)} size="small" />
          )}
          {observation.date && (
            <Typography sx={medicalDataStyles.labCardDate}>
              {observation.date}
            </Typography>
          )}
        </Box>
      </Box>

      {expanded && (
        <Box sx={medicalDataStyles.labCardExpanded}>
          <Typography sx={medicalDataStyles.resultsHeading}>Results:</Typography>
            <Typography sx={medicalDataStyles.resultsDetails}>{observation.details}</Typography>
            <Typography sx={medicalDataStyles.aiDisclaimer}>Disclaimer: This explanation is AI-generated and is not medical advice. Please see your doctor for medical guidance.</Typography>
            <Typography sx={medicalDataStyles.aiExplanationLabel}>AI explanation</Typography>
          {loading ? (
            <Box sx={medicalDataStyles.generatingBox}>
              <CircularProgress size={14} sx={medicalDataStyles.generatingProgress} />
              <Typography sx={medicalDataStyles.generatingText}>Generating...</Typography>
            </Box>
          ) : (
            <>
              <Typography sx={medicalDataStyles.explanationText}>{explanation}</Typography>
              {explanation && (
                <Box sx={medicalDataStyles.askButtonBox}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (setSelectedObservation) setSelectedObservation(observation);
                      if (setChatOpen) setChatOpen(true);
                    }}
                    sx={medicalDataStyles.askButton}
                  >
                    Ask question
                  </Button>
                </Box>
              )}
            </>
          )}
        </Box>
      )}
    </Box>
  );
}

export default function MedicalData({ conditions, observations, documentTexts = [] }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedObservation, setSelectedObservation] = useState(null);
  return (
    <Box sx={medicalDataStyles.pageBox}>
      <Typography variant="h5" sx={medicalDataStyles.title}>
        Medical Data
      </Typography>

      <Box sx={medicalDataStyles.sectionCard(2)}>
        <Typography sx={medicalDataStyles.smallHeading}>Active conditions</Typography>
        <Box sx={medicalDataStyles.conditionsWrap}>
          {conditions.map((condition, index) => (
            <Box key={index} sx={medicalDataStyles.conditionPill}>
              {condition}
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={medicalDataStyles.sectionCard() }>
        <Typography sx={medicalDataStyles.smallHeading}>Recent observations</Typography>
        {observations.map((observation) => (
          <LabCard
            key={observation.id}
            observation={observation}
            setChatOpen={setChatOpen}
            setSelectedObservation={setSelectedObservation}
          />
        ))}
      </Box>
      <>
        {/* Chat widget anchored bottom-right */}
        <ChatWidget
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          contextObservation={selectedObservation}
          documentTexts={documentTexts}
        />
      </>
    </Box>
  );
}
