import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Handlebars from 'handlebars'
import { utils, read as readXlsx } from 'xlsx'
import Swal from 'sweetalert2'
import useClipboardApi from 'use-clipboard-api'
import { Scrollbars } from 'react-custom-scrollbars-2'
import { nanoid } from 'nanoid'
import SheetHelper from './SheetHelper'
import DocModal from './DocModal'
import './app.css'

const Toast = Swal.mixin({
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
  position: 'top',
  toast: true,
})

Handlebars.registerHelper('toFixed', (val, precision) => {
  switch (typeof val) {
    case 'string':
      return parseFloat(val).toFixed(precision)
    case 'number':
      return val.toFixed(precision)
    default:
      return ''
  }
})

const App = () => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFile(acceptedFiles[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
  })

  const [template, setTemplate] = useState('')
  const [output, setOutput] = useState('')
  const [sheets, setSheets] = useState<string[] | null>(null)
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [cols, setCols] = useState<string[] | null>(null)
  const [_, copy] = useClipboardApi()
  const [showDocModal, setShowDocModal] = useState(false)

  const handleReset = () => {
    setOutput('')
    setTemplate('')
    setSelectedSheet(null)
    setSheets(null)
    setSelectedFile(null)
    setCols(null)
    location.reload()
  }

  const myCopy = (val: string) => {
    copy(val)
    Toast.fire({
      icon: 'success',
      title: 'Copied!',
    })
  }

  const handleCopy = () => {
    myCopy(output)
  }

  useEffect(() => {
    if (!selectedFile) {
      setSheets([])
      setSelectedSheet(null)
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const res = e.target?.result
      if (!res) return
      setSheets(readXlsx(res).SheetNames)
    }
    reader.readAsArrayBuffer(selectedFile)
  }, [selectedFile])

  useEffect(() => {
    if (!selectedSheet || !selectedFile) {
      setCols(null)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const res = e.target?.result
      if (!res) return
      const set = new Set(
        Object.keys(
          utils.sheet_to_json<Record<string, unknown>>(
            readXlsx(res).Sheets[selectedSheet]
          )[0]
        )
      )
      if (set.size > 0) {
        setCols(Array.from(set))
      }
    }
    reader.readAsArrayBuffer(selectedFile)
  }, [selectedSheet, selectedFile])

  const handleGenerate = () => {
    if (!selectedFile) {
      Swal.fire({ title: 'Error', text: 'Select a file first' })
      return
    }
    if (!selectedSheet) {
      Swal.fire({ title: 'Error', text: 'Select a sheet' })
      return
    }

    try {
      const t = Handlebars.compile(template)
      const reader = new FileReader()
      reader.onload = (e) => {
        const res = e.target?.result
        if (!res) return
        const data = utils
          .sheet_to_json<Record<string, string>>(
            readXlsx(res).Sheets[selectedSheet]
          )
          .map((d) => ({
            ...d,
            uuid: nanoid(),
          }))
        setOutput(
          t(
            { data },
            {
              helpers: {
                nanoIdHelper: () => nanoid(),
              },
            }
          )
        )
      }
      reader.readAsArrayBuffer(selectedFile)
    } catch (e) {
      Swal.fire({ title: 'Error', text: 'Template error' })
    }
  }

  return (
    <Scrollbars style={{ width: '100%', height: '100vh' }}>
      <div id={'app'} className={'container mx-auto py-2 px-2'}>
        <SheetHelper cols={cols} />
        <DocModal
          isOpen={showDocModal}
          onClose={() => setShowDocModal(false)}
        />

        <div className={'navbar bg-base-100'}>
          <div className={'flex-1'}>
            <h1 className={'text-2xl font-semibold'}>ofclock</h1>
          </div>
          <div className={'flex-none'}>
            <button className={'btn'} onClick={() => setShowDocModal(true)}>
              Docs
            </button>
          </div>
        </div>
        <div className={'section'}>
          <div className={'form-control'}>
            <label htmlFor={'file-select'}>
              <span className={'label-text uppercase text-xl font-semibold'}>
                file
              </span>
            </label>
            {selectedFile ? (
              <>
                <div
                  className={[
                    'h-20 w-full bg-gray-200 rounded-lg mt-2 font-code p-4',
                    'flex justify-center items-center transition',
                  ].join(' ')}
                >
                  <span>{selectedFile.name}</span>
                  <button
                    className={'btn btn-outline ml-4'}
                    onClick={() => {
                      setSelectedFile(null)
                    }}
                  >
                    Reset
                  </button>
                </div>
              </>
            ) : (
              <>
                <div
                  {...getRootProps({
                    className: [
                      'h-20 w-full bg-gray-50 rounded-lg mt-2 font-code p-4',
                      'flex justify-center items-center transition hover:bg-gray-200',
                      'focus:ring-2 focus:ring-offset-2 focus:ring-gray-200',
                    ].join(' '),
                  })}
                >
                  <input {...getInputProps({ id: 'file-select' })} />
                  {isDragActive ? (
                    <p>Drop the files here ...</p>
                  ) : (
                    <p>
                      Drag a xlsx or xls file here, or click to select files
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className={'section'}>
          <div className={'form-control'}>
            <label htmlFor={'sheet'}>
              <span className={'label-text uppercase text-xl font-semibold'}>
                sheet
              </span>
            </label>
            <select
              id={'sheet'}
              className={'select select-bordered w-full mt-2 text-lg'}
              onChange={(e) => {
                setSelectedSheet(e.target.value)
              }}
              defaultValue={'default'}
            >
              <option disabled value={'default'}>
                Select a sheet
              </option>
              {sheets?.map((s, idx) => (
                <option key={idx}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={'section'}>
          <div className={'form-control'}>
            <label htmlFor={'template'}>
              <span className={'label-text uppercase text-xl font-semibold'}>
                template
              </span>
            </label>
            <textarea
              id={'template'}
              className={
                'textarea textarea-bordered w-full h-80 mt-2 font-code resize-none'
              }
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
            ></textarea>
          </div>
        </div>

        <div className={'section'}>
          <button className={'btn'} onClick={handleGenerate}>
            Generate
          </button>
          <button className={'btn btn-warning ml-4'} onClick={handleReset}>
            Reset All
          </button>
        </div>

        <div className={'section'}>
          <div className={'form-control'}>
            <label htmlFor={'result'}>
              <span className={'label-text uppercase text-xl font-semibold'}>
                result
              </span>
            </label>
            <div className={'result-container w-full h-80 mt-2 relative'}>
              <button
                onClick={handleCopy}
                className={'btn btn-sm absolute right-6 top-4'}
              >
                Copy
              </button>
              <textarea
                id={'result'}
                className={
                  'textarea textarea-bordered w-full h-80 font-code resize-none'
                }
                value={output}
                readOnly
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </Scrollbars>
  )
}

export default App
