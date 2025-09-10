import React, { useEffect, useState, useRef } from "react";
// ✅ Main navbar integration - using main project navigation for consistency
import MainNav from "../../MainNav/MainNav";
import axios from "axios";
import Package from "../Package/Package";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const URL = "http://localhost:5000/package";

const fetchHandler = async () => {
  return await axios.get(URL).then((res) => res.data);
};

function Packages() {
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    fetchHandler().then((data) => setPackages(data.packages));
  }, []);

  const componentsRef = useRef();

  const handleDownloadPDF = () => {
    const input = componentsRef.current;
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("Packages_Report.pdf");
      alert("Packages Report Successfully Downloaded!");
    });
  };

  return (
    <div>
      {/* ✅ Main navbar integration - ensures consistent navigation across all subsystems */}
      <MainNav />
      <h1>Package Details Display Page</h1>
      <div ref={componentsRef}>
        {packages &&
          packages.map((pkg, i) => (
            <div key={i}>
              <Package package={pkg} />
            </div>
          ))}
      </div>
      <button onClick={handleDownloadPDF}>Download Packages Report</button>
    </div>
  );
}

export default Packages;
