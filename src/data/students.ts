export interface StudentInfo {
  seatNumber: string; // "01" ~ "31"
  studentId: string;  // e.g. "410115"
  name: string;       // e.g. "王萬富"
}

export const CLASS_205_STUDENTS: StudentInfo[] = [
  { seatNumber: '01', studentId: '410115', name: '王萬富' },
  { seatNumber: '02', studentId: '410132', name: '蘇展' },
  { seatNumber: '03', studentId: '410202', name: '呂芃諼' },
  { seatNumber: '04', studentId: '410212', name: '鄭韻音' },
  { seatNumber: '05', studentId: '410213', name: '賴禹彤' },
  { seatNumber: '06', studentId: '410215', name: '朱昌岳' },
  { seatNumber: '07', studentId: '410413', name: '鄭琇云' },
  { seatNumber: '08', studentId: '410502', name: '吳玉馨' },
  { seatNumber: '09', studentId: '410523', name: '陳佑禮' },
  { seatNumber: '10', studentId: '410526', name: '黃彥翔' },
  { seatNumber: '11', studentId: '410609', name: '程翊涵' },
  { seatNumber: '12', studentId: '410618', name: '李承駿' },
  { seatNumber: '13', studentId: '410701', name: '王品涵' },
  { seatNumber: '14', studentId: '410708', name: '涂津菊' },
  { seatNumber: '15', studentId: '410709', name: '張涵溱' },
  { seatNumber: '16', studentId: '410805', name: '陳月苓' },
  { seatNumber: '17', studentId: '410806', name: '陳月茹' },
  { seatNumber: '18', studentId: '410807', name: '曾苡嘉' },
  { seatNumber: '19', studentId: '410810', name: '劉祐岑' },
  { seatNumber: '20', studentId: '410812', name: '蔡侑璇' },
  { seatNumber: '21', studentId: '410817', name: '王育宬' },
  { seatNumber: '22', studentId: '410902', name: '余瑞縈' },
  { seatNumber: '23', studentId: '410925', name: '黃浚享' },
  { seatNumber: '24', studentId: '410928', name: '歐陽豐' },
  { seatNumber: '25', studentId: '411003', name: '林昀諄' },
  { seatNumber: '26', studentId: '411004', name: '胡妤苹' },
  { seatNumber: '27', studentId: '411014', name: '籃嘉榕' },
  { seatNumber: '28', studentId: '411022', name: '陳育政' },
  { seatNumber: '29', studentId: '411601', name: '陳漢嶔' },
  { seatNumber: '30', studentId: '411604', name: '吳晉輔' },
  { seatNumber: '31', studentId: '411608', name: '洪妤恩' },
];

export const STUDENT_MAP = new Map<string, StudentInfo>(
  CLASS_205_STUDENTS.map((st) => [st.seatNumber, st])
);

export function getStudentBySeat(seat: string): StudentInfo | undefined {
  const formatted = seat.trim().padStart(2, '0');
  return STUDENT_MAP.get(formatted);
}
