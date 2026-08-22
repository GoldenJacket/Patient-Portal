import { useEffect, useState } from 'react';
import FHIR from 'fhirclient';
import { extractPatient, extractConditions, extractObservations } from '../utils/fhirUtils';

const FHIR_BASE = 'https://r4.smarthealthit.org';
const DEFAULT_PATIENT_ID = '87a339d0-8cae-418e-89c7-8651e6aab3c6';

export function useFhir(patientId) {
  const [patient, setPatient] = useState(null);
  const [conditions, setConditions] = useState([]);
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const id = patientId || DEFAULT_PATIENT_ID;
      try {
        const client = FHIR.client({ serverUrl: FHIR_BASE });
        const [patientRes, conditionsRes, observationsRes] = await Promise.all([
          client.request(`Patient/${id}`),
          client.request(`Condition?patient=${id}&_count=20`),
          client.request(`Observation?patient=${id}&category=laboratory&_count=20`),
        ]);
        setPatient(extractPatient(patientRes));
        setConditions(extractConditions(conditionsRes));
        setObservations(extractObservations(observationsRes));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [patientId]);

  return { patient, conditions, observations, loading, error };
}
