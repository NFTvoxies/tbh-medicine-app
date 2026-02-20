'use client'

export default function GlobalError({ error, reset }) {
    return (
        <html>
            <body>
                <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
                    <h2>Something went wrong!</h2>
                    <p style={{ color: '#888', marginBottom: '1rem' }}>{error?.message}</p>
                    <button
                        onClick={() => reset()}
                        style={{
                            padding: '0.5rem 1.25rem',
                            background: '#7c3aed',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                        }}
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    )
}
