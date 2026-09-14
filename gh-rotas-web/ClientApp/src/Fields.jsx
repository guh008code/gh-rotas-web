import { useState } from 'react';
export function Field({ label, name, type = 'text', ...props }) {
  const [visible, setVisible] = useState(false);
  return <div className="field"><label htmlFor={name}>{label}</label><div className="input-wrap"><input id={name} name={name} type={type === 'password' && visible ? 'text' : type} {...props}/>{type === 'password' && <button className="reveal" type="button" aria-label={`${visible ? 'Ocultar' : 'Mostrar'} ${label.toLowerCase()}`} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? 'Ocultar' : 'Mostrar'}</button>}</div></div>;
}
export function Notice({ children, success = false }) {
  return children ? <div className={`notice ${success ? 'success' : ''}`} role={success ? 'status' : 'alert'}>{children}</div> : null;
}
