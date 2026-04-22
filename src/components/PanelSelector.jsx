import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Plus } from 'lucide-react';

/**
 * PanelSelector
 *
 * Shows the currently active panel and lets the owner switch between
 * registered panels. Designed to be unobtrusive with one panel,
 * functional with many.
 *
 * Props:
 *   panels       — array of { id, label, location }
 *   activePanelId — id string of the currently selected panel
 *   onChange     — (panelId) => void
 */
const PanelSelector = ({ panels = [], activePanelId, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const activePanel = panels.find((p) => p.id === activePanelId) ?? panels[0];

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (id) => {
    onChange?.(id);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 12px',
          background: '#0C1220',
          border: '0.5px solid #1E293B',
          borderRadius: 99,
          color: '#CBD5E1',
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'border-color .2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#334155')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1E293B')}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#14B8A6',
            flexShrink: 0,
          }}
        />
        {activePanel?.label ?? 'Select panel'}
        <ChevronDown
          size={12}
          style={{
            color: '#475569',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform .2s',
          }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            background: '#0C1220',
            border: '0.5px solid #1E293B',
            borderRadius: 12,
            padding: 6,
            minWidth: 180,
            zIndex: 50,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          {panels.map((panel) => {
            const isActive = panel.id === activePanelId;
            return (
              <button
                key={panel.id}
                onClick={() => handleSelect(panel.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '7px 10px',
                  background: isActive ? '#111827' : 'transparent',
                  border: 'none',
                  borderRadius: 8,
                  color: isActive ? '#14B8A6' : '#94A3B8',
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background .15s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = '#111827';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span>{panel.label}</span>
                {isActive && (
                  <span
                    style={{
                      fontSize: 9,
                      padding: '2px 6px',
                      background: 'rgba(20,184,166,0.12)',
                      color: '#14B8A6',
                      borderRadius: 99,
                      letterSpacing: '0.04em',
                    }}
                  >
                    active
                  </span>
                )}
              </button>
            );
          })}

          {/* Add panel */}
          <div
            style={{
              borderTop: '0.5px solid #1E293B',
              marginTop: 4,
              paddingTop: 4,
            }}
          >
            <button
              onClick={() => {
                setOpen(false);
                alert(
                  'To add a new panel, install a second SolarIQ device and register its panel-id in your Firebase database under /panels.'
                );
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                width: '100%',
                padding: '7px 10px',
                background: 'transparent',
                border: 'none',
                borderRadius: 8,
                color: '#475569',
                fontSize: 12,
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                transition: 'background .15s, color .15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#111827';
                e.currentTarget.style.color = '#94A3B8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#475569';
              }}
            >
              <Plus size={11} />
              Add panel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PanelSelector;