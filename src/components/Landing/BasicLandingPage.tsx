interface BasicLandingPageProps {
  onGetStarted: () => void;
}

export default function BasicLandingPage({ onGetStarted }: BasicLandingPageProps) {
  return (
    <div 
      style={{
        width: '100%',
        height: '100vh',
        backgroundColor: '#111827',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div 
        style={{
          maxWidth: '600px',
          textAlign: 'center'
        }}
      >
        <h1 style={{ 
          fontSize: '3rem', 
          marginBottom: '1.5rem', 
          color: '#3B82F6',
          fontWeight: 'bold'
        }}>
          EasyHabits
        </h1>
        
        <p style={{ 
          fontSize: '1.25rem', 
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          Track your habits, the easy way.
        </p>
        
        <button 
          onClick={onGetStarted}
          style={{
            backgroundColor: '#22c55e',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '0.5rem',
            border: 'none',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#22c55e'}
        >
          Get Started
        </button>
        
        <div style={{
          marginTop: '3rem',
          fontSize: '1rem',
          color: '#9CA3AF'
        }}>
          © {new Date().getFullYear()} EasyHabits
        </div>
      </div>
    </div>
  );
}
