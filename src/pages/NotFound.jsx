import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NotFound.module.css';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className={`${styles.container} page-enter`}>
      <div className={styles.code}>404</div>
      <div className={styles.emoji}>🎓</div>
      <h1 className={styles.title}>Page Not Found</h1>
      <p className={styles.sub}>Looks like this page transferred to another school.</p>
      <div className={styles.buttons}>
        <button className={styles.home} onClick={() => navigate('/')}>Go to Dashboard</button>
        <button className={styles.back} onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    </div>
  );
}
