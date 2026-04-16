import { useIncidentStore } from '../../stores/incidentStore';
import { Phone } from 'lucide-react';

export default function ContactCard() {
  const incident = useIncidentStore((s) => s.selectedIncident);

  if (!incident || incident.contacts.length === 0) {
    return null;
  }

  return (
    <div className="mt-3">
      <h3 className="text-gray-400 text-xs font-mono font-semibold uppercase tracking-widest mb-2">
        Key Contacts
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {incident.contacts.map((contact, idx) => (
          <div key={idx} className="glass-panel p-2.5">
            <p className="text-gray-200 text-xs font-semibold font-mono">{contact.name}</p>
            <p className="text-gray-500 text-xs">{contact.role}</p>
            {contact.phone && (
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center gap-1 text-aegis-cyan hover:text-white text-xs mt-1 transition-colors font-mono"
              >
                <Phone size={11} />
                {contact.phone}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
