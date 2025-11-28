CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role ENUM('student','faculty','alumni','admin') NOT NULL,
  department VARCHAR(100),
  graduation_year INT,
  company VARCHAR(200),
  position VARCHAR(200),
  linkedin_profile VARCHAR(500),
  mentorship_available BOOLEAN DEFAULT FALSE,
  contact_info_visible BOOLEAN DEFAULT FALSE,
  is_email_verified BOOLEAN DEFAULT FALSE,
  is_suspended BOOLEAN DEFAULT FALSE,
  suspension_reason TEXT,
  suspension_end DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lectures (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  faculty_id VARCHAR(36) NOT NULL,
  faculty_name VARCHAR(200) NOT NULL,
  video_url VARCHAR(1000) NOT NULL,
  video_duration INT NOT NULL,
  transcript LONGTEXT,
  captions JSON,
  department VARCHAR(100) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  views INT DEFAULT 0,
  is_public BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mentorship_requests (
  id VARCHAR(36) PRIMARY KEY,
  student_id VARCHAR(36) NOT NULL,
  alumni_id VARCHAR(36) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('pending','accepted','rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP NULL,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (alumni_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS admin_codes (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(100) UNIQUE NOT NULL,
  used_by VARCHAR(36),
  used_at TIMESTAMP NULL,
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (used_by) REFERENCES users(id) ON DELETE SET NULL
);

INSERT IGNORE INTO admin_codes (id, code, expires_at)
VALUES (UUID(), 'ADMIN_CAMPUS_2024', DATE_ADD(NOW(), INTERVAL 1 YEAR));

CREATE TABLE IF NOT EXISTS views_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  lecture_id VARCHAR(36),
  user_id VARCHAR(36),
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (lecture_id),
  INDEX (user_id)
);
