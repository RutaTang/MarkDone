const withBold = (editor) => {
  const {onChange} = editor
  editor.onChange = ()=>{
    onChange()
  }
  return editor;
};
export default withBold;
