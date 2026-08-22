export function extractPatient(resource) {
  const name = resource.name?.[0];
  const fullName = name
    ? `${name.given?.join(' ')} ${name.family}`
    : 'Unknown';

  const birthDate = resource.birthDate;
  const age = birthDate
    ? new Date().getFullYear() - new Date(birthDate).getFullYear()
    : 'Unknown';

  const extension = resource.extension || [];
  const raceExt = extension.find(
    (e) => e.url === 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-race'
  );
  const race =
    raceExt?.extension?.find((e) => e.url === 'text')?.valueString || 'Unknown';

  const address = resource.address?.[0];
  const addressStr = address
    ? `${address.line?.join(', ')}, ${address.city}, ${address.state} ${address.postalCode}`
    : 'Unknown';

  return { name: fullName, age, race, address: addressStr };
}

export function extractConditions(bundle) {
  const entries = bundle.entry || [];
  return entries.map(
    (e) =>
      e.resource?.code?.text ||
      e.resource?.code?.coding?.[0]?.display ||
      'Unknown condition'
  );
}

export function extractObservations(bundle) {
  const entries = bundle.entry || [];
  return entries.map((e, index) => {
    const res = e.resource;
    const title = res.code?.text || res.code?.coding?.[0]?.display || 'Lab Result';

    const rawValue = res.valueQuantity?.value;
    const unit = res.valueQuantity?.unit || '';
    const cleanUnit = unit.replace(/[{}_]/g, '').trim();
    const value = rawValue
      ? `${parseFloat(rawValue).toFixed(2)} ${cleanUnit}`.trim()
      : res.valueString || 'See details';

    const date = res.effectiveDateTime?.split('T')[0] || '';

    const interpretation = res.interpretation?.[0]?.coding?.[0]?.code;
    const summary =
      interpretation === 'H' ? 'High'
      : interpretation === 'L' ? 'Low'
      : interpretation === 'N' ? 'Normal'
      : 'Recorded';

    return {
      id: res.id || `obs-${index}`,
      title,
      summary,
      details: value,
      date,
    };
  });
}
