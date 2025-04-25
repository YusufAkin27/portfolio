/**
 * Project Detail JavaScript
 */

// Force load all images immediately when script loads (don't wait for DOMContentLoaded)
(function() {
    // Try to preload images immediately
    setTimeout(preloadProjectImages, 0);
    
    // Check if we should force reload all images (set by main.js when navigating)
    if (sessionStorage.getItem('forceReloadProjectImages') === 'true') {
        // Force reload all images multiple times to ensure they load
        setTimeout(preloadProjectImages, 100);
        setTimeout(preloadProjectImages, 500);
        setTimeout(forceDisplayContent, 200);
        
        // Clear the flag
        sessionStorage.removeItem('forceReloadProjectImages');
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    // Preload all images immediately on page load again
    preloadProjectImages();
    
    // Image Gallery Functionality
    initImageGallery();
    
    // Code Syntax Highlighting
    highlightCodeBlocks();
    
    // Animation for Project Content
    animateProjectContent();
    
    // Initialize File Upload
    initFileUpload();
    
    // Set up another preload attempt after a short delay
    setTimeout(preloadProjectImages, 500);
});

// Also ensure images load when the window finishes loading
window.addEventListener('load', () => {
    // Final attempt to preload all images
    preloadProjectImages();
    
    // Force display all content sections
    forceDisplayContent();
});

/**
 * Force all content sections to display
 */
function forceDisplayContent() {
    // Make all sections visible
    const sections = document.querySelectorAll('.project-info > div');
    sections.forEach(section => {
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
        section.style.display = 'block';
        section.style.visibility = 'visible';
    });
    
    // Make all thumbnails and images visible
    document.querySelectorAll('.thumbnail, .main-image, img').forEach(el => {
        el.style.opacity = '1';
        el.style.visibility = 'visible';
        el.style.display = el.tagName === 'IMG' ? 'inline-block' : 'block';
    });
}

/**
 * Preload all project images to ensure they're loaded on initial page visit
 */
function preloadProjectImages() {
    // Get all image elements
    const allImages = document.querySelectorAll('img');
    
    // Try fixing the specific issue with .png vs .jpg extensions
    fixImageExtensions();
    
    // Preload each image with a stronger approach
    allImages.forEach(img => {
        // Always try to force load the image
        const imgSrc = img.getAttribute('src');
        if (imgSrc) {
            // Create a new image to force loading with cache busting
            const tempImg = new Image();
            const newSrc = imgSrc.includes('?') ? imgSrc : imgSrc + '?t=' + new Date().getTime();
            
            // Set onload handler to update the actual image
            tempImg.onload = function() {
                img.src = this.src;
                img.classList.remove('placeholder-img');
                img.style.opacity = '1';
                
                // Fix potential image path issues
                if (this.src.includes('.png') && img.src.includes('.jpg')) {
                    img.src = img.src.replace('.jpg', '.png');
                }
                if (this.src.includes('.jpeg') && img.src.includes('.jpg')) {
                    img.src = img.src.replace('.jpg', '.jpeg');
                }
            };
            
            // Also set direct attributes to force browser to load
            img.style.opacity = '1';
            img.setAttribute('src', newSrc);
            
            // Start loading the image
            tempImg.src = newSrc;
        }
    });

    // Force load main image gallery
    const mainImage = document.querySelector('.main-image img');
    if (mainImage) {
        const src = mainImage.getAttribute('src');
        mainImage.style.opacity = '1';
        mainImage.setAttribute('src', src + '?t=' + new Date().getTime());
    }
    
    // Force load all thumbnails and try alternative extensions if needed
    const thumbnails = document.querySelectorAll('.thumbnail img');
    thumbnails.forEach(thumb => {
        const src = thumb.getAttribute('src');
        const newSrc = src + '?t=' + new Date().getTime();
        thumb.setAttribute('src', newSrc);
        
        // Try loading with alternative file extensions if the original fails
        thumb.onerror = function() {
            // If .png fails, try .jpg
            if (this.src.includes('.png')) {
                this.src = this.src.replace('.png', '.jpg');
            }
            // If .jpg fails, try .jpeg
            else if (this.src.includes('.jpg') && !this.src.includes('.jpeg')) {
                this.src = this.src.replace('.jpg', '.jpeg');
            }
        };
    });
    
    // Make all content sections visible
    forceDisplayContent();
}

/**
 * Fix image extensions for commonly mismatched files
 */
function fixImageExtensions() {
    // Look for images that might have the wrong extension
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        const src = img.getAttribute('src');
        if (!src) return;
        
        // Check if this is a common file pattern from the campus-social project
        if (src.includes('campus-social') && src.includes('.jpg') && src.includes('sayfa')) {
            // Try .png instead for this specific project
            const newSrc = src.replace('.jpg', '.png');
            img.setAttribute('src', newSrc);
        }
        
        // Also check for anasayfa.jpg which should be anasayfa.png in campus-social
        if (src.includes('campus-social') && src.includes('anasayfa.jpg')) {
            const newSrc = src.replace('anasayfa.jpg', 'anasayfa.png');
            img.setAttribute('src', newSrc);
        }
    });
}

/**
 * Initialize the image gallery with thumbnail switching
 */
function initImageGallery() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.querySelector('.main-image img');
    
    if (!thumbnails.length || !mainImage) return;
    
    // Set up click event for each thumbnail
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', () => {
            // Remove active class from all thumbnails
            thumbnails.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked thumbnail
            thumbnail.classList.add('active');
            
            // Get image source from thumbnail
            const thumbnailImg = thumbnail.querySelector('img');
            if (thumbnailImg) {
                const newSrc = thumbnailImg.getAttribute('src');
                const newAlt = thumbnailImg.getAttribute('alt');
                
                // Simply update the src attribute without transitions
                mainImage.setAttribute('src', newSrc);
                if (newAlt) {
                    mainImage.setAttribute('alt', newAlt);
                }
                
                // Show image immediately without fading
                mainImage.style.opacity = '1';
            }
        });
    });
    
    // Ensure no transition is applied
    mainImage.style.transition = 'none';
}

/**
 * Apply syntax highlighting to code blocks
 * Note: This is a placeholder function that would normally use a library like Prism.js or highlight.js
 */
function highlightCodeBlocks() {
    const codeBlocks = document.querySelectorAll('pre code');
    
    // If a syntax highlighting library is available, it would be used here
    // For now, we'll just add some basic styling
    codeBlocks.forEach(block => {
        block.style.display = 'block';
        block.style.overflowX = 'auto';
        
        // Add line numbers
        const lines = block.textContent.split('\n');
        if (lines.length > 1) {
            const formattedCode = lines.map((line, index) => {
                // Skip the first or last line if it's empty
                if ((index === 0 || index === lines.length - 1) && line.trim() === '') {
                    return '';
                }
                return line;
            }).join('\n');
            
            block.textContent = formattedCode;
        }
    });
}

/**
 * Animate project content sections as they scroll into view
 */
function animateProjectContent() {
    const sections = document.querySelectorAll('.project-info > div');
    
    // Create intersection observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    });
    
    // Add initial styling and observe each section
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(section);
    });
    
    // Function to handle animation end
    document.addEventListener('transitionend', (e) => {
        if (e.target.classList.contains('fade-in')) {
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateY(0)';
        }
    });
}

/**
 * Initialize file upload functionality
 */
function initFileUpload() {
    const uploadForm = document.getElementById('uploadForm');
    const fileInput = document.getElementById('fileInput');
    const selectedFiles = document.getElementById('selectedFiles');
    const filesList = document.getElementById('filesList');
    const selectFilesBtn = document.querySelector('.select-files-btn');
    
    if (!uploadForm || !fileInput || !selectedFiles || !filesList) return;
    
    // Handle the Select Files button click
    if (selectFilesBtn) {
        selectFilesBtn.addEventListener('click', () => {
            fileInput.click();
        });
    }
    
    // When files are selected
    fileInput.addEventListener('change', () => {
        updateSelectedFilesList();
    });
    
    // Handle drag and drop functionality
    const uploadArea = document.querySelector('.upload-area');
    if (uploadArea) {
        // Prevent default behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });
        
        // Highlight drop area when a file is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.add('highlight');
            }, false);
        });
        
        // Remove highlight when file is dragged away or dropped
        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.remove('highlight');
            }, false);
        });
        
        // Handle dropped files
        uploadArea.addEventListener('drop', (e) => {
            fileInput.files = e.dataTransfer.files;
            updateSelectedFilesList();
        }, false);
    }
    
    // Handle form submission
    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Check if files were selected
        if (fileInput.files.length === 0) {
            alert('Lütfen yüklemek için dosya seçin');
            return;
        }
        
        // In a real implementation, here we would:
        // 1. Create a FormData object
        // 2. Send an AJAX request to upload the files
        // 3. Handle the server response
        
        // For this demo, we'll simulate an upload and add files to the list
        simulateFileUpload();
    });
    
    // Update the selected files list
    function updateSelectedFilesList() {
        selectedFiles.innerHTML = '';
        
        if (fileInput.files.length === 0) {
            return;
        }
        
        Array.from(fileInput.files).forEach(file => {
            const fileItem = createFileItem(file.name, true);
            selectedFiles.appendChild(fileItem);
        });
    }
    
    // Create a file item for the list
    function createFileItem(fileName, isSelected = false) {
        const fileItem = document.createElement('div');
        fileItem.className = isSelected ? 'selected-file' : 'file-item';
        
        // File icon based on file type
        const fileExt = fileName.split('.').pop().toLowerCase();
        let iconClass = 'fa-file';
        
        if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(fileExt)) {
            iconClass = 'fa-file-image';
        } else if (['pdf'].includes(fileExt)) {
            iconClass = 'fa-file-pdf';
        } else if (['doc', 'docx', 'txt', 'md'].includes(fileExt)) {
            iconClass = 'fa-file-word';
        } else if (['xls', 'xlsx', 'csv'].includes(fileExt)) {
            iconClass = 'fa-file-excel';
        } else if (['zip', 'rar', '7z'].includes(fileExt)) {
            iconClass = 'fa-file-archive';
        } else if (['mp4', 'mov', 'avi'].includes(fileExt)) {
            iconClass = 'fa-file-video';
        } else if (['js', 'html', 'css', 'php', 'py', 'java'].includes(fileExt)) {
            iconClass = 'fa-file-code';
        }
        
        // Create file item structure
        if (isSelected) {
            fileItem.innerHTML = `
                <i class="fas ${iconClass} file-icon"></i>
                <span class="selected-file-name">${fileName}</span>
                <button type="button" class="remove-file"><i class="fas fa-times"></i></button>
            `;
            
            // Add event listener to remove button
            fileItem.querySelector('.remove-file').addEventListener('click', () => {
                fileItem.remove();
                
                // In a real implementation, we would need to update the FileList object
                // This is not straightforward due to its read-only nature
                // In production, consider using a library or custom solution
            });
        } else {
            fileItem.innerHTML = `
                <i class="fas ${iconClass} file-icon"></i>
                <span class="file-name">${fileName}</span>
                <div class="file-actions">
                    <button type="button" class="file-action-btn download-btn"><i class="fas fa-download"></i></button>
                    <button type="button" class="file-action-btn delete-btn"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            
            // Add event listeners for download and delete buttons
            fileItem.querySelector('.download-btn').addEventListener('click', () => {
                // In a real implementation, this would download the file
                alert(`${fileName} indirilmeye başlıyor...`);
            });
            
            fileItem.querySelector('.delete-btn').addEventListener('click', () => {
                // In a real implementation, this would delete the file from the server
                fileItem.remove();
                
                if (filesList.children.length === 0) {
                    const noFiles = document.createElement('li');
                    noFiles.className = 'no-files';
                    noFiles.textContent = 'Henüz dosya yüklenmemiş';
                    filesList.appendChild(noFiles);
                }
            });
        }
        
        return fileItem;
    }
    
    // Simulate file upload (for demo purposes)
    function simulateFileUpload() {
        const uploadBtn = uploadForm.querySelector('.upload-btn');
        const originalText = uploadBtn.textContent;
        
        // Show uploading state
        uploadBtn.textContent = 'Yükleniyor...';
        uploadBtn.disabled = true;
        
        setTimeout(() => {
            // Clear selected files
            const fileItems = Array.from(fileInput.files);
            
            // Update files list
            if (filesList.querySelector('.no-files')) {
                filesList.innerHTML = '';
            }
            
            fileItems.forEach(file => {
                const listItem = document.createElement('li');
                const fileElem = createFileItem(file.name);
                listItem.appendChild(fileElem);
                filesList.appendChild(listItem);
            });
            
            // Reset the form
            uploadForm.reset();
            selectedFiles.innerHTML = '';
            
            // Reset button state
            uploadBtn.textContent = originalText;
            uploadBtn.disabled = false;
            
            // Show success message
            alert('Dosyalar başarıyla yüklendi!');
        }, 1500);
    }
}

/**
 * Handle placeholder images
 * This function checks if an image fails to load and applies a placeholder style
 */
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        // Check if image already has placeholder class
        if (img.classList.contains('placeholder-img')) {
            // Try to force load the image first
            const imgSrc = img.getAttribute('src');
            if (imgSrc) {
                // Add cache-busting parameter
                const newSrc = imgSrc.includes('?') ? imgSrc : imgSrc + '?t=' + new Date().getTime();
                img.setAttribute('src', newSrc);
            }
            
            // If it's still not loaded after a short delay, show placeholder
            setTimeout(() => {
                if (!img.complete || img.naturalWidth === 0) {
                    handlePlaceholderImage(img);
                } else {
                    img.style.opacity = '1';
                }
            }, 500);
        }
        
        // Add load handler
        img.addEventListener('load', () => {
            img.style.opacity = '1';
            img.classList.remove('placeholder-img');
            
            // Remove placeholder if exists
            const parent = img.parentElement;
            if (parent) {
                const placeholder = parent.querySelector('span');
                if (placeholder && placeholder !== img) {
                    parent.removeChild(placeholder);
                }
            }
        });
        
        // Add error handler for any image that fails to load
        img.addEventListener('error', () => {
            // Try reloading once with cache busting
            const imgSrc = img.getAttribute('src');
            if (imgSrc && !imgSrc.includes('?t=')) {
                img.setAttribute('src', imgSrc + '?t=' + new Date().getTime());
            } else {
                handlePlaceholderImage(img);
            }
        });
    });
});

/**
 * Apply placeholder styling to an image element
 */
function handlePlaceholderImage(img) {
    const altText = img.getAttribute('alt') || 'Image';
    const parent = img.parentElement;
    
    // Create placeholder text element
    const placeholder = document.createElement('span');
    placeholder.textContent = altText;
    placeholder.style.position = 'absolute';
    placeholder.style.top = '50%';
    placeholder.style.left = '50%';
    placeholder.style.transform = 'translate(-50%, -50%)';
    placeholder.style.color = 'var(--text-secondary)';
    placeholder.style.fontSize = '1rem';
    placeholder.style.textAlign = 'center';
    placeholder.style.width = '80%';
    
    // Style the parent element if it exists
    if (parent) {
        parent.style.position = 'relative';
    }
    
    // Make the image transparent but keep dimensions
    img.style.opacity = '0';
    
    // Add placeholder text
    if (parent) {
        parent.appendChild(placeholder);
    }
} 