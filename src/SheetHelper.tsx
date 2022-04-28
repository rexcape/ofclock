import { useState } from 'react'

const SheetHelper = ({ cols }: { cols: string[] | null }) => {
  const [show, setShow] = useState(false)
  return (
    <>
      <button
        className={'btn btn-xs btn-outline fixed bottom-8 right-8 z-10'}
        onClick={() => setShow(!show)}
      >
        Tool
      </button>
      {show && (
        <div
          className={
            'card border-2 border-gray-200 w-96 h-96 fixed bg-gray-100 bottom-16 right-8 z-10'
          }
        >
          <div className={'card-body'}>
            {cols ? (
              <>
                <h2 className={'card-title uppercase'}>Cols</h2>
                <ul className={'menu rounded-box p-2'}>
                  {cols.map((c, idx) => (
                    <li key={idx}>
                      <button
                        className={'tooltip text-lg font-bold'}
                        data-tip={'Click to copy'}
                      >
                        {c}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <h2 className={'card-title uppercase'}>no cols</h2>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default SheetHelper
