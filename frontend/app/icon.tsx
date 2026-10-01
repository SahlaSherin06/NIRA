import { ImageResponse } from 'next/og'

/**
 * Function: runtime
 * Executes the core operations and logic for runtime.
 */
export const runtime = 'edge'

/**
 * Function: size
 * Executes the core operations and logic for size.
 */
export const size = {
  width: 32,
  height: 32,
}
/**
 * Function: contentType
 * Executes the core operations and logic for content type.
 */
export const contentType = 'image/png'

/**
 * Component: Icon
 * Renders the UI and handles the internal logic for the Icon.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 22,
          background: '#e8dfd8',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#7a303f',
          borderRadius: '8px',
          fontFamily: 'serif',
          fontWeight: 'bold',
        }}
      >
        N
      </div>
    ),
    { ...size }
  )
}
