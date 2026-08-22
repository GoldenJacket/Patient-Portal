import { supabase } from './supabaseClient';
import FHIR from 'fhirclient';

const FHIR_BASE = 'https://r4.smarthealthit.org';

async function findFhirPatientByName(firstName, lastName) {
  try {
    const client = FHIR.client({ serverUrl: FHIR_BASE });
    const bundle = await client.request(
      `Patient?given=${encodeURIComponent(firstName)}&family=${encodeURIComponent(lastName)}`
    );

    const entries = bundle.entry || [];
    if (entries.length === 0) return null;

    // Take the first matching patient
    const resource = entries[0].resource;

    const name = resource.name?.[0];
    const extractedFirst = name?.given?.join(' ') || '';
    const extractedLast = name?.family || '';

    const birthDate = resource.birthDate;
    const age = birthDate
      ? new Date().getFullYear() - new Date(birthDate).getFullYear()
      : null;

    const extension = resource.extension || [];
    const raceExt = extension.find(
      (e) => e.url === 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-race'
    );
    const race = raceExt?.extension?.find((e) => e.url === 'text')?.valueString || null;

    const address = resource.address?.[0];
    const addressStr = address
      ? `${address.line?.join(', ')}, ${address.city}, ${address.state} ${address.postalCode}`
      : null;

    return {
      fhirPatientId: resource.id,
      firstName: extractedFirst,
      lastName: extractedLast,
      age,
      race,
      address: addressStr,
    };
  } catch {
    return null;
  }
}

export async function registerUser(email, password, firstName, lastName) {
  // 1. Search FHIR by name
  const patientData = await findFhirPatientByName(firstName, lastName);
  if (!patientData) {
    return { success: false, message: 'No matching patient found in the FHIR database. Please check your name and try again.' };
  }

  // 2. Sign up with Supabase auth
const { data, error } = await supabase.auth.signUp({ email, password });
if (error) {
  if (error.message.includes('already registered')) {
    return { success: false, message: 'An account with this email already exists.' };
  }
  return { success: false, message: 'Registration failed. Please try again.' };
}

// 2b. Set session immediately so RLS works for subsequent writes
if (data.session) {
  await supabase.auth.setSession(data.session);
}

  // 3. Store profile with fhir_patient_id
  await supabase.from('profiles').upsert({
    id: data.user.id,
    email,
    fhir_patient_id: patientData.fhirPatientId,
  });

  // 4. Populate patient_profiles from FHIR data
  await supabase.rpc('insert_patient_profile', {
    p_user_email: email,
    p_first_name: patientData.firstName,
    p_last_name: patientData.lastName,
    p_age: patientData.age,
    p_race: patientData.race,
    p_address: patientData.address,
    p_fhir_patient_id: patientData.fhirPatientId,
  });

  return { success: true, user: data.user, patientData };
}

export async function loginUser(email, password) {
  // 1. Sign in with Supabase auth
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    return { success: false, message: 'Invalid email or password.' };
  }

  // 2. Get fhir_patient_id from profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('fhir_patient_id')
    .eq('id', data.user.id)
    .single();

  if (!profile?.fhir_patient_id) {
    return { success: false, message: 'No FHIR patient linked to this account.' };
  }

  // 3. Verify still valid in FHIR
  try {
    const client = FHIR.client({ serverUrl: FHIR_BASE });
    const resource = await client.request(`Patient/${profile.fhir_patient_id}`);
    if (!resource || resource.resourceType !== 'Patient') {
      return { success: false, message: 'Your patient record could not be verified in the FHIR database.' };
    }
  } catch {
    return { success: false, message: 'Your patient record could not be verified in the FHIR database.' };
  }

  // 4. Fetch patient profile from Supabase
  const { data: profileData } = await supabase
    .from('patient_profiles')
    .select('*')
    .eq('user_email', email)
    .single();

  return { success: true, user: { ...data.user, ...profileData, fhirPatientId: profile.fhir_patient_id } };
}
