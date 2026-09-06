import { useState } from 'react'

type TabType = 'pizzas' | 'hamburgueres' | 'bebidas' | 'sobremesas' | 'promocoes'

interface Tab {
  id: TabType
  label: string
  icon: string
}

interface TabsNavigationProps {
  tabs: Tab[]
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export default function TabsNavigation({ tabs, activeTab, onTabChange }: TabsNavigationProps) {
  const [showAllTabs, setShowAllTabs] = useState(false)

  const cores: Record<TabType, string> = {
    pizzas: '#FF6B35',
    hamburgueres: '#8B4513',
    bebidas: '#4A90E2',
    sobremesas: '#C2185B',
    promocoes: '#FFD700'
  }

  const renderTabs = (tabsToShow: Tab[]) => (
    <>
      {tabsToShow.map((aba) => (
        <button
          key={aba.id}
          onClick={() => {
            onTabChange(aba.id)
            setShowAllTabs(false)
          }}
          style={{
            background: activeTab === aba.id
              ? `linear-gradient(135deg, ${cores[aba.id]}, ${cores[aba.id]}CC)`
              : 'rgba(255, 255, 255, 0.1)',
            color: activeTab === aba.id ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)',
            border: activeTab === aba.id
              ? '2px solid rgba(255, 255, 255, 0.3)'
              : '2px solid rgba(255, 255, 255, 0.1)',
            padding: '1rem 2rem',
            borderRadius: '15px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backdropFilter: 'blur(10px)',
            boxShadow: activeTab === aba.id
              ? `0 8px 25px ${cores[aba.id]}66`
              : '0 4px 15px rgba(0, 0, 0, 0.3)',
            flex: '1 0 auto',
            minWidth: '180px',
            justifyContent: 'center',
            whiteSpace: 'nowrap'
          }}
          className="tab-button"
        >
          <span style={{ fontSize: '1.5rem' }}>{aba.icon}</span>
          <span className="tab-label">{aba.label}</span>
        </button>
      ))}
    </>
  )

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      margin: '2rem auto 3rem auto',
      padding: '0 20px',
      maxWidth: '1400px',
      width: '100%'
    }}>
      {/* CONTAINER PRINCIPAL COM SCROLL HORIZONTAL EM MOBILE */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.8rem',
          justifyContent: 'center',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollBehavior: 'smooth',
          paddingBottom: '0.5rem'
        }}
        className="tabs-scroll-container"
      >
        {renderTabs(tabs)}
      </div>

      {/* INDICADOR DE SCROLL (MOBILE) */}
      <div
        style={{
          textAlign: 'center',
          fontSize: '0.85rem',
          color: 'rgba(255, 255, 255, 0.6)',
          display: 'none'
        }}
        className="scroll-hint"
      >
        ← Deslize para ver mais →
      </div>

      <style>{`
        .tabs-scroll-container {
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 215, 0, 0.3) transparent;
        }

        .tabs-scroll-container::-webkit-scrollbar {
          height: 4px;
        }

        .tabs-scroll-container::-webkit-scrollbar-track {
          background: transparent;
        }

        .tabs-scroll-container::-webkit-scrollbar-thumb {
          background: rgba(255, 215, 0, 0.3);
          border-radius: 2px;
        }

        .tabs-scroll-container::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 215, 0, 0.5);
        }

        .tab-button {
          flex-shrink: 0;
        }

        .tab-label {
          display: inline;
        }

        @media (max-width: 1024px) {
          .tab-button {
            min-width: 160px;
            padding: 0.9rem 1.5rem;
            font-size: 1rem;
          }

          .tab-label {
            display: inline;
          }
        }

        @media (max-width: 768px) {
          .tabs-scroll-container {
            justify-content: flex-start;
            overflow-x: auto;
            padding: 0.5rem 0;
            gap: 0.6rem;
          }

          .tab-button {
            min-width: 140px;
            padding: 0.8rem 1.2rem;
            font-size: 0.95rem;
            flex-shrink: 0;
          }

          .tab-label {
            display: inline;
          }

          .scroll-hint {
            display: block;
          }
        }

        @media (max-width: 480px) {
          .tabs-scroll-container {
            gap: 0.5rem;
          }

          .tab-button {
            min-width: 120px;
            padding: 0.7rem 1rem;
            font-size: 0.85rem;
          }

          .tab-button span:last-child {
            display: none;
          }

          .tab-label {
            display: none;
          }

          .scroll-hint {
            display: block;
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  )
}
