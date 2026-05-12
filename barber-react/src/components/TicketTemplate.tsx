import React from 'react';
import ticketBg from '../assets/ticket-bg.svg';

interface TicketTemplateProps {
  uniqueCode: string;
  serviceName: string;
  date: string;
  time: string;
}

const TicketTemplate: React.FC<TicketTemplateProps> = ({
  uniqueCode,
  serviceName,
  date,
  time,
}) => {
  return (
    <div
      id="ticket-template"
      style={{
        position: 'absolute',
        top: '-9999px', // Sembunyikan of layar
        left: '-9999px',
        width: '900px',
        height: '600px', // Asumsi rasio SVG
        backgroundColor: '#1a1a1a',
        fontFamily: "'Montserrat', sans-serif",
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <img
          src={ticketBg}
          alt="Ticket Background"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />

        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          {/* Main Code */}
          <div
            style={{
              position: 'absolute',
              top: '47%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#cfb160',
              fontSize: '50px',
              fontWeight: 700,
              letterSpacing: '2px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
            }}
          >
            {uniqueCode}
          </div>

          {/* Details Table */}
          <table
            style={{
              position: 'absolute',
              top: '58%',
              left: '28%',
              color: '#e0e0e0',
              fontSize: '14px',
              borderCollapse: 'collapse',
              letterSpacing: '1px',
            }}
          >
            <tbody>
              <tr>
                <td style={{ paddingBottom: '8px', verticalAlign: 'top', width: '90px' }}>
                  SERVICE:
                </td>
                <td style={{ paddingBottom: '8px', verticalAlign: 'top', fontWeight: 600 }}>
                  {serviceName}
                </td>
              </tr>
              <tr>
                <td style={{ paddingBottom: '8px', verticalAlign: 'top', width: '90px' }}>
                  DATE:
                </td>
                <td style={{ paddingBottom: '8px', verticalAlign: 'top', fontWeight: 600 }}>
                  {date}
                </td>
              </tr>
              <tr>
                <td style={{ paddingBottom: '8px', verticalAlign: 'top', width: '90px' }}>
                  TIME:
                </td>
                <td style={{ paddingBottom: '8px', verticalAlign: 'top', fontWeight: 600 }}>
                  {time}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TicketTemplate;
