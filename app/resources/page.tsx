"use client";
import React, { useState } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ResourcesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const categories = [
    "Bitcoin Mining",
    "HPC",
    "Grid Support",
    "Sustainability",
    "Technology",
    "Finance",
  ];

  const documents = [
    {
      title: "Bitcoin Mining Overview",
      date: "2023-01-15",
      category: "Bitcoin Mining",
      link: "/docs/bitcoin-mining.pdf",
    },
    {
      title: "HPC Infrastructure",
      date: "2023-02-20",
      category: "HPC",
      link: "/docs/hpc-infrastructure.pdf",
    },
    {
      title: "Grid Support Strategies",
      date: "2023-03-10",
      category: "Grid Support",
      link: "/docs/grid-support.pdf",
    },
    {
      title: "Sustainable Mining Practices",
      date: "2023-04-05",
      category: "Sustainability",
      link: "docs/sustainable-mining.pdf",
    },
    {
      title: "White Paper",
      date: "2023-05-12",
      category: "Technology",
      link: "/docs/white-paper.pdf",
    },
    {
      title: "Cryptocurrency Finance",
      date: "2023-06-18",
      category: "Finance",
      link: "/docs/crypto-finance.pdf",
    },
  ];

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(doc.category);
    return matchesSearch && matchesCategory;
  });

  return (
    <section className="relative bg-zinc-900/20 pt-40 pb-24 lg:pt-48 lg:pb-32 text-white overflow-hidden">
      <div className="max-w-4xl mx-auto mb-32 text-center px-6 lg:px-12">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight font-sans bg-gradient-to-r from-white to-zinc-100 bg-clip-text text-transparent">
          Resources & Downloads
        </h1>
        <p className="mt-6 text-lg md:text-xl text-zinc-300 leading-relaxed">
          Dive into Potentia’s world with our curated resources—everything you
          need to understand our work in Bitcoin mining, HPC, and grid support.
        </p>
      </div>

      <div className="max-w-8xl mx-auto mt-16 px-6 lg:px-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filter Section */}
          <div className="md:w-1/3">
            <div className="bg-zinc-900/40 backdrop-blur-lg rounded-xl border border-zinc-800/60 p-6 shadow-lg">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Filter Resources
              </h2>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full p-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:border-zinc-600 mb-4"
              />
              {selectedCategories.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm text-zinc-400 mb-2">
                    Selected Categories:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategories.map((cat) => (
                      <span
                        key={cat}
                        className="bg-zinc-700 text-white px-2 py-1 rounded flex items-center text-sm"
                      >
                        {cat}
                        <button
                          onClick={() =>
                            setSelectedCategories((prev) =>
                              prev.filter((c) => c !== cat)
                            )
                          }
                          className="ml-2 text-zinc-400 hover:text-white"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <h3 className="text-sm text-zinc-400 mb-2">Categories:</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategories((prev) =>
                          prev.includes(cat)
                            ? prev.filter((c) => c !== cat)
                            : [...prev, cat]
                        );
                      }}
                      className={`px-3 py-1 rounded text-sm ${
                        selectedCategories.includes(cat)
                          ? "bg-blue-500 text-white"
                          : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Document Grid */}
          <div className="md:w-[1300px] md:h-[] ml-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredDocuments.map((doc, index) => (
                <div
                  key={index}
                  className="p-5 border border-zinc-700 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-all duration-300"
                >
                  <FileText className="w-24 h-24 text-zinc-300 my-4 text-center" />
                  <h3 className="text-md my-5 font-semibold text-white">
                    {doc.title} ({doc.date})
                  </h3>
                  <div className="flex justify-between">
                    <span className="text-sm text-zinc-400 bg-zinc-700/50 px-2 text-center rounded mr-4 mt-2">
                      PDF
                    </span>
                    <a
                      href={doc.link}
                      download
                      className="mt-2 inline-block text-black bg-white rounded-lg p-2 hover:underline text-xs"
                    >
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-36 text-center px-6 lg:px-12">
        <p className="text-xl md:text-2xl text-white mb-8">
          Need more information or ready to join Potentia’s mission? Reach out
          today.
        </p>
        <Link href="/contact" passHref>
          <Button
            variant="default"
            size="lg"
            className="px-8 py-3 bg-white border border-zinc-700 text-black rounded-full hover:bg-zinc-700 transition-all duration-300"
          >
            Contact Us
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default ResourcesPage;
