import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { pdfService, highlightService } from '../services/api';
import { toast } from 'react-toastify';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import './PDFViewer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PDFViewer = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();

  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [highlights, setHighlights] = useState([]);
  const [selectedText, setSelectedText] = useState('');
  const [selectionCoords, setSelectionCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageHeight, setPageHeight] = useState(0);
  const [pageWidth, setPageWidth] = useState(0);

  const pageRef = useRef(null);

  const loadPDF = useCallback(async () => {
    try {
      const response = await pdfService.getPDF(uuid);
      const url = URL.createObjectURL(response.data);
      setPdfUrl(url);
    } catch (error) {
      toast.error('Failed to load PDF');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [uuid, navigate]);

  const loadHighlights = useCallback(async () => {
    try {
      const response = await highlightService.getByPDF(uuid);
      setHighlights(response.data.highlights);
    } catch (error) {
      console.error('Failed to load highlights:', error);
    }
  }, [uuid]);

  // useEffect update karo:
  useEffect(() => {
    loadPDF();
    loadHighlights();
  }, [uuid, loadPDF, loadHighlights]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const onPageLoadSuccess = (page) => {
    setPageHeight(page.height);
    setPageWidth(page.width);
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (text && pageRef.current) {
      const range = selection.getRangeAt(0);
      const rects = range.getClientRects();

      if (rects.length > 0) {
        const pageRect = pageRef.current.getBoundingClientRect();
        const rect = rects[0];

        // Calculate relative position within the PDF page
        const relativeCoords = {
          x: (rect.x - pageRect.x) / scale / pageWidth,
          y: (rect.y - pageRect.y) / scale / pageHeight,
          width: rect.width / scale / pageWidth,
          height: rect.height / scale / pageHeight,
          pageNumber: pageNumber,
        };

        setSelectedText(text);
        setSelectionCoords(relativeCoords);
      }
    }
  };

  const saveHighlight = async () => {
    if (!selectedText || !selectionCoords) {
      toast.error('Please select some text first');
      return;
    }

    try {
      const highlightData = {
        pdfId: uuid,
        pageNumber: selectionCoords.pageNumber,
        highlightedText: selectedText,
        boundingBox: {
          x: selectionCoords.x,
          y: selectionCoords.y,
          width: selectionCoords.width,
          height: selectionCoords.height,
        },
        color: '#ffff00',
      };

      const response = await highlightService.create(highlightData);
      setHighlights([...highlights, response.data.highlight]);

      window.getSelection().removeAllRanges();
      setSelectedText('');
      setSelectionCoords(null);

      toast.success('Highlight saved! 🎨');
    } catch (error) {
      toast.error('Failed to save highlight');
    }
  };

  const deleteHighlight = async (highlightId) => {
    try {
      await highlightService.delete(highlightId);
      setHighlights(highlights.filter((h) => h._id !== highlightId));
      toast.success('Highlight deleted');
    } catch (error) {
      toast.error('Failed to delete highlight');
    }
  };

  const renderHighlights = () => {
    if (!pageRef.current) return null;

    return highlights
      .filter((h) => h.pageNumber === pageNumber)
      .map((highlight) => (
        <div
          key={highlight._id}
          className="highlight-overlay"
          style={{
            position: 'absolute',
            left: `${highlight.boundingBox.x * 100}%`,
            top: `${highlight.boundingBox.y * 100}%`,
            width: `${highlight.boundingBox.width * 100}%`,
            height: `${highlight.boundingBox.height * 100}%`,
            backgroundColor: highlight.color || 'rgba(255, 255, 0, 0.4)',
            pointerEvents: 'none',
            mixBlendMode: 'multiply',
          }}
        />
      ));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading PDF...</p>
      </div>
    );
  }

  return (
    <div className="pdf-viewer-container">
      <div className="pdf-toolbar">
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          ← Back to Library
        </button>

        <div className="page-controls">
          <button
            onClick={() => setPageNumber(pageNumber - 1)}
            disabled={pageNumber <= 1}
          >
            Previous
          </button>
          <span>
            Page {pageNumber} of {numPages}
          </span>
          <button
            onClick={() => setPageNumber(pageNumber + 1)}
            disabled={pageNumber >= numPages}
          >
            Next
          </button>
        </div>

        <div className="zoom-controls">
          <button onClick={() => setScale(scale - 0.1)} disabled={scale <= 0.5}>
            Zoom Out
          </button>
          <span>{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(scale + 0.1)} disabled={scale >= 2}>
            Zoom In
          </button>
        </div>

        {selectedText && (
          <button onClick={saveHighlight} className="highlight-btn">
            💡 Save Highlight
          </button>
        )}
      </div>

      <div className="pdf-content">
        {pdfUrl && (
          <div className="pdf-page-wrapper" onMouseUp={handleTextSelection}>
            <div className="pdf-page-container" ref={pageRef}>
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<div className="spinner"></div>}
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  onLoadSuccess={onPageLoadSuccess}
                  renderTextLayer={true}
                  renderAnnotationLayer={false}
                />
              </Document>
              <div className="highlights-layer">{renderHighlights()}</div>
            </div>
          </div>
        )}
      </div>

      <div className="highlights-sidebar">
        <h3>Highlights on this page</h3>
        {highlights.filter((h) => h.pageNumber === pageNumber).length === 0 ? (
          <p className="no-highlights">No highlights on this page</p>
        ) : (
          <div className="highlights-list">
            {highlights
              .filter((h) => h.pageNumber === pageNumber)
              .map((highlight) => (
                <div key={highlight._id} className="highlight-item">
                  <div
                    className="highlight-color-indicator"
                    style={{ backgroundColor: highlight.color }}
                  ></div>
                  <p>"{highlight.highlightedText}"</p>
                  <button
                    onClick={() => deleteHighlight(highlight._id)}
                    className="delete-highlight-btn"
                  >
                    Delete
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
