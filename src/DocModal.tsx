import Modal from 'react-modal'

const jsonCode = `[
  {
    "fruit": "apple",
    "price": 10
  },
  {
    "fruit": "banana",
    "price": 15
  }
]`

const handlebarsCode = `{{#each data}}{{fruit}} {{price}}{{/each}}`

const outputVal = `apple 10
price 15`

const DocModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  return (
    <Modal isOpen={isOpen} portalClassName={'modal'}>
      <div>
        <p>首先选择文件、选择 Sheet</p>
        <p>假设选择的是这样一个表格</p>
        <table className={'table'}>
          <thead>
            <tr>
              <th>fruit</th>
              <th>price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>apple</td>
              <td>10</td>
            </tr>
            <tr>
              <td>banana</td>
              <td>15</td>
            </tr>
          </tbody>
        </table>
        <p>数据会是这样的</p>
        <div className={'p-2 border border-gray-200'}>
          <code>{jsonCode}</code>
        </div>
        <p>在模板部分这样写</p>
        <div className={'p-2 border border-gray-200'}>
          <code>{handlebarsCode}</code>
        </div>
        <p>会得到如下输出</p>
        <div className={'p-2 border border-gray-200'}>
          <code>{outputVal}</code>
        </div>
        <button className={'btn'} onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  )
}

export default DocModal
