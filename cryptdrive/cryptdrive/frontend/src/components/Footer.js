import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-3 mt-auto">
      <div className="container text-center">
        &copy; {new Date().getFullYear()} CryptDrive
      </div>
    </footer>
  );
};

export default Footer;
