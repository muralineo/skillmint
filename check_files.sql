-- Check code files for the specific session
SELECT 
  scf.id,
  scf.file_name,
  scf.language,
  LENGTH(scf.file_content) as file_size,
  cs.session_number,
  cs.topic
FROM session_code_files scf
JOIN course_sessions cs ON cs.id = scf.session_id
WHERE cs.course_id = 'b10ad891-4f52-4520-a217-3226cd844d31'
ORDER BY cs.session_number, scf.file_name;
