import { Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import ReactMarkdown from 'react-markdown';

// 5. Upgraded Legal Document Page
const DocumentPage = ({ title, content }) => {
    const navigate = useNavigate();

    console.log(content)
    return (

        <Suspense fallback={(
            <main className='errorDisplay'>
                <h2>Loading<span className="animated-dots"></span></h2>
            </main>
        )}>
            <div className="mx-auto max-w-4xl p-6 max-md:p-2 lg:p-10 relative">

                <style>{`
        /* Budget Buddy Markdown Styles */
        .markdown-body h2 { font-size: 1.5rem; font-weight: 800; color: #1f2937; margin-top: 2rem; margin-bottom: 0.75rem; }
        .markdown-body h2:first-child { margin-top: 0; }
        .markdown-body h3 { font-size: 1.25rem; font-weight: 700; color: #374151; margin-top: 1.5rem; margin-bottom: 0.5rem; }
        .markdown-body p { margin-bottom: 1.25rem; line-height: 1.7; }
        .markdown-body ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.25rem; }
        .markdown-body li { margin-bottom: 0.5rem; line-height: 1.6; }
        .markdown-body a { color: #f97316; text-decoration: none; font-weight: 600; transition: color 0.2s; }
        .markdown-body a:hover { color: #ea580c; text-decoration: underline; }
        .markdown-body strong { font-weight: 700; color: #111827; }
        .markdown-body hr { margin: 2rem 0; border: none; border-top: 1px solid #f3f4f6; }

@media (max-width: 768px) {
  .markdown-body h2 { 
    font-size: 1.25rem; 
    margin-top: 1.5rem; 
    margin-bottom: 0.5rem; 
  }
  .markdown-body h3 { 
    font-size: 1.125rem; 
    margin-top: 1.25rem; 
  }
  .markdown-body p { 
    font-size: 0.95rem; 
    margin-bottom: 1rem; 
    line-height: 1.6; 
  }
  .markdown-body ul { 
    padding-left: 1.25rem; 
    margin-bottom: 1rem; 
  }
  .markdown-body li { 
    font-size: 0.95rem; 
    margin-bottom: 0.375rem; 
  }
  .markdown-body blockquote { 
    padding: 0.875rem 1rem; 
    margin-bottom: 1.5rem; 
  }
}

        .markdown-body blockquote {
          background: #fff7ed;
          border-left: 4px solid #f97316;
          padding: 1rem 1.5rem;
          border-radius: 0 0.5rem 0.5rem 0;
          margin-bottom: 2rem;
          color: #c2410c;
        }
        .markdown-body blockquote p {
          margin-bottom: 0;
        }
      `}</style>
                {/* Sticky Back Button so users can easily leave long documents */}
                <div className="sticky top-20 right-0 z-10 mb-6 max-md:mb-2 flex justify-end">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 rounded-full border border-gray-200 bg-white/90 backdrop-blur-md px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md hover:-translate-y-0.5"
                    >
                        <ArrowLeft size={16} />
                        Back to App
                    </button>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm max-md:mb-[6rem]">
                    <div className="bg-orange-500 px-6 py-8 text-white sm:px-10">
                        <h1 className="text-3xl font-black">{title}</h1>
                        <p className="mt-2 text-orange-100 text-sm font-medium flex items-center gap-1.5">
                            <Clock size={14} />
                            Last Updated: April 2026
                        </p>
                    </div>

                    <div className="markdown-body p-6 text-gray-700 sm:p-10">
                        <ReactMarkdown>{content.toString()}</ReactMarkdown>
                    </div>
                </div>

                {/* Tiny injection of CSS just for the TL;DR blockquotes */}
            </div>
        </Suspense>
    );
};

export default DocumentPage;
