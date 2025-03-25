import React, { useEffect, useState } from 'react';

function BookContent({ text, annotations, handleTextSelection, currentPage}) {

    useEffect(() => {
        if (currentPage && currentPage > 0) {
            const pageElement = document.querySelector(`.page-content:nth-child(${currentPage})`);
            if (pageElement) {
                pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, [currentPage]);

    useEffect(() => {
        console.log("New Annotations: " + annotations);
        const annotation = document.getElementById('annotation-0');
        if (annotation) {
            annotation.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, [annotations]);

    const generatePages = (text) => {
        if (!text) return null;

        // Split text into pages by <br> tags
        const unFiltedPages = text.split(/<br\s*\/?>/);
        const pages = unFiltedPages.filter(e => e.trim() !== "");

        const splitAnnotations = annotations.split("<br>");

        return (
            <div className="book-pages">
                {pages.map((pageContent, pageIndex) => (
                    <div key={pageIndex} className="page-content">                 
                        <div className="page-indicator">
                            Page {pageIndex + 1}
                        </div>
                        <div className="page-text">
                            {highLightPages(pageContent, splitAnnotations)}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const highLightPages = (text, splitAnnotations) => {
        if (!annotations || annotations.length === 0) {
            return text;
        }

        let splitPage = [];
        let annotationNum = -1;
        for (let i in splitAnnotations) {
            const tmpSplit = text.split(splitAnnotations[i]);
            if (tmpSplit.length > 1) {
                splitPage = tmpSplit;
                annotationNum = i;
            }
        }

        if (splitPage.length === 0) {
            return text;
        }

        console.log(splitPage);

        return  (<>
            {splitPage[0]}
            <span className='highlight' id={`annotation-${annotationNum}`}>
                {splitAnnotations[annotationNum]}
            </span>
            {splitPage[1]}
        </>)
    }

    return (
        <div className="book-content">
            <div className="book-text">
                <div 
                    className="text-content"
                    onMouseUp={handleTextSelection}
                >
                    {generatePages(text)}
                </div>
            </div>
        </div>
    );
}

export default BookContent; 