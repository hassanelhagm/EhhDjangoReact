// components/PrintStudent.jsx


export default function PrintStudent({ student }) {
  return (
    <div style={{ padding: '20px' }}>
      <h2>{student.name}</h2>
      <img src={student.photo} alt="Student" style={{ width: '150px' }} />
      <p><strong>SSN:</strong> {student.ssn}</p>
      <p><strong>Email:</strong> {student.email}</p>
      <p><strong>Phone:</strong> {student.cell_phone}</p>
      <p><strong>Degree Level:</strong> {student.degree_level.name}</p>
      <QRCode value={student.ssn} />
    </div>
  );
}
