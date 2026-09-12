"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  Download,
  BookOpen,
  Award,
  Briefcase,
  Layers,
  X,
  FileText,
  UserCheck,
  Compass,
} from "lucide-react";
import type { CurriculumDto } from "@/features/curriculum";

interface Props {
  curricula: CurriculumDto[];
  isTh: boolean;
}

export function CurriculumPortalView({ curricula, isTh }: Props) {
  const [selectedItem, setSelectedItem] = useState<CurriculumDto | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "plos" | "structure" | "careers">("overview");

  return (
    <>
      {curricula.length === 0 ? (
        <div className="p-16 text-center rounded-2xl border border-dashed border-border text-muted-foreground">
          <p className="text-base font-medium">
            {isTh ? "ไม่พบหลักสูตรในเงื่อนไขที่เลือก" : "No programs found matching the selected criteria"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {curricula.map((item) => (
            <div
              key={item.id}
              className="group rounded-3xl border border-border/60 bg-card p-6 sm:p-8 space-y-6 flex flex-col justify-between hover:border-brand/60 hover:shadow-lg transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-brand/10 text-brand">
                      {item.degreeLevel}
                    </span>
                    {item.departmentNameTh && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-muted text-foreground/80 border border-border/60">
                        <Building2 className="w-3 h-3 text-brand" />
                        <span>{isTh ? item.departmentNameTh : item.departmentNameEn}</span>
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">{item.code}</span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground leading-tight group-hover:text-brand transition-colors">
                    {isTh ? item.nameTh : item.nameEn}
                  </h3>
                  <p className="text-sm text-brand font-medium mt-1">
                    {isTh ? item.degreeTh : item.degreeEn}
                  </p>
                </div>

                {item.philosophy && (
                  <p className="text-xs text-muted-foreground italic line-clamp-2 bg-muted/30 p-2.5 rounded-xl border border-border/40">
                    &ldquo;{item.philosophy}&rdquo;
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4 py-3 border-y border-border/40 text-xs">
                  <div>
                    <span className="text-muted-foreground block">{isTh ? "จำนวนหน่วยกิตรวม" : "Total Credits"}</span>
                    <span className="font-bold text-foreground text-sm">
                      {item.totalCredits} {isTh ? "หน่วยกิต" : "Credits"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">{isTh ? "สถานะการเปิดรับ" : "Admission Status"}</span>
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{item.status}</span>
                    </span>
                  </div>
                </div>

                {item.careerPaths && item.careerPaths.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-brand" />
                      <span>{isTh ? "เส้นทางอาชีพเด่น:" : "Key Career Paths:"}</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.careerPaths.slice(0, 3).map((career, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-muted/60 text-[11px] text-foreground/80 border border-border/40"
                        >
                          {career.length > 35 ? career.slice(0, 35) + "..." : career}
                        </span>
                      ))}
                      {item.careerPaths.length > 3 && (
                        <span className="text-[10px] text-muted-foreground self-center">
                          +{item.careerPaths.length - 3} {isTh ? "อาชีพ" : "more"}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedItem(item);
                    setActiveTab("overview");
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-muted/70 hover:bg-muted text-xs font-semibold text-foreground transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-brand" />
                  <span>{isTh ? "ดูรายละเอียดหลักสูตร (มคอ. 2)" : "View Program Details"}</span>
                </button>

                <div className="flex items-center gap-2">
                  {item.brochurePdfUrl && (
                    <a
                      href={item.brochurePdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl border border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title={isTh ? "ดาวน์โหลดเอกสาร มคอ. 2 (PDF)" : "Download PDF Document"}
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}

                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-xl bg-brand text-on-brand text-xs font-semibold hover:bg-brand/90 transition-colors"
                  >
                    {isTh ? "สมัครเข้าศึกษา" : "Apply Now"}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* CURRICULUM DETAIL MODAL (TQF 2 / มคอ. 2) */}
      {/* ---------------------------------------------------- */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/60">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-brand/10 text-brand">
                    {selectedItem.degreeLevel}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">{selectedItem.code}</span>
                  {selectedItem.departmentNameTh && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <span>•</span>
                      <span>{isTh ? selectedItem.departmentNameTh : selectedItem.departmentNameEn}</span>
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  {isTh ? selectedItem.nameTh : selectedItem.nameEn}
                </h2>
                <p className="text-sm font-semibold text-brand">
                  {isTh ? selectedItem.degreeTh : selectedItem.degreeEn}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Stat Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/40 text-center">
                <span className="text-[11px] text-muted-foreground block">{isTh ? "หน่วยกิตรวม" : "Credits"}</span>
                <span className="text-base font-bold text-foreground">{selectedItem.totalCredits}</span>
              </div>
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/40 text-center">
                <span className="text-[11px] text-muted-foreground block">{isTh ? "ระยะเวลาศึกษา" : "Duration"}</span>
                <span className="text-base font-bold text-foreground">{isTh ? "๔ ปี (๘ ภาค)" : "4 Years"}</span>
              </div>
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/40 text-center">
                <span className="text-[11px] text-muted-foreground block">{isTh ? "ค่าธรรมเนียม" : "Tuition"}</span>
                <span className="text-base font-bold text-foreground">
                  {selectedItem.tuitionFee ? `${Number(selectedItem.tuitionFee).toLocaleString()} ฿` : "-"}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/40 text-center">
                <span className="text-[11px] text-muted-foreground block">{isTh ? "สถานะ" : "Status"}</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">{selectedItem.status}</span>
              </div>
            </div>

            {/* Detail Tabs */}
            <div className="flex border-b border-border/60 gap-1 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === "overview"
                    ? "border-brand text-brand"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {isTh ? "ปรัชญาและวัตถุประสงค์" : "Philosophy & Objectives"}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("plos")}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === "plos"
                    ? "border-brand text-brand"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {isTh ? "ผลลัพธ์การเรียนรู้ (PLOs)" : "Learning Outcomes (PLOs)"}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("structure")}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === "structure"
                    ? "border-brand text-brand"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {isTh ? "โครงสร้างหลักสูตร" : "Curriculum Structure"}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("careers")}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === "careers"
                    ? "border-brand text-brand"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {isTh ? "โอกาสทางอาชีพ & คุณสมบัติ" : "Careers & Admission"}
              </button>
            </div>

            {/* Tab Contents */}
            <div className="space-y-4">
              {activeTab === "overview" && (
                <div className="space-y-4">
                  {selectedItem.philosophy && (
                    <div className="p-4 rounded-2xl bg-brand/5 border border-brand/20 space-y-1.5">
                      <span className="text-xs font-bold text-brand uppercase tracking-wider flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5" />
                        <span>{isTh ? "ปรัชญาของหลักสูตร" : "Program Philosophy"}</span>
                      </span>
                      <p className="text-sm text-foreground/90 font-medium leading-relaxed">
                        &ldquo;{selectedItem.philosophy}&rdquo;
                      </p>
                    </div>
                  )}

                  {selectedItem.objectives && selectedItem.objectives.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-brand" />
                        <span>{isTh ? "วัตถุประสงค์ของหลักสูตร" : "Program Objectives"}</span>
                      </h4>
                      <ul className="space-y-2">
                        {selectedItem.objectives.map((obj, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand/10 text-brand font-bold text-[11px] flex items-center justify-center mt-0.5">
                              {i + 1}
                            </span>
                            <span className="leading-relaxed">{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "plos" && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-brand" />
                    <span>
                      {isTh
                        ? "ผลลัพธ์การเรียนรู้ที่คาดหวังของหลักสูตร (Program Learning Outcomes - PLOs)"
                        : "Program Learning Outcomes"}
                    </span>
                  </h4>
                  {selectedItem.plos && selectedItem.plos.length > 0 ? (
                    <div className="space-y-2.5">
                      {selectedItem.plos.map((plo, i) => (
                        <div
                          key={i}
                          className="p-3.5 rounded-2xl bg-muted/40 border border-border/50 flex items-start gap-3"
                        >
                          <span className="px-2.5 py-1 rounded-lg bg-brand text-on-brand text-xs font-bold whitespace-nowrap">
                            {plo.code}
                          </span>
                          <div className="space-y-0.5">
                            <p className="text-xs text-foreground font-medium leading-relaxed">{plo.descTh}</p>
                            {plo.descEn && (
                              <p className="text-[11px] text-muted-foreground italic leading-relaxed">{plo.descEn}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {isTh ? "ไม่มีข้อมูล PLOs ที่ระบุไว้" : "No PLOs defined"}
                    </p>
                  )}
                </div>
              )}

              {activeTab === "structure" && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-brand" />
                    <span>{isTh ? "โครงสร้างหมวดวิชาและจำนวนหน่วยกิต" : "Credit Breakdown & Structure"}</span>
                  </h4>
                  {selectedItem.studyPlan && selectedItem.studyPlan.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2.5">
                      {selectedItem.studyPlan.map((plan, i) => (
                        <div
                          key={i}
                          className="p-3.5 rounded-2xl bg-muted/40 border border-border/50 flex items-center justify-between gap-4"
                        >
                          <div className="space-y-0.5">
                            <h5 className="text-xs font-bold text-foreground">{plan.categoryTh}</h5>
                            {plan.description && (
                              <p className="text-[11px] text-muted-foreground">{plan.description}</p>
                            )}
                          </div>
                          <span className="px-3 py-1 rounded-xl bg-card border border-border text-xs font-bold text-brand whitespace-nowrap">
                            {plan.credits} {isTh ? "หน่วยกิต" : "Credits"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-muted/30 text-xs text-muted-foreground">
                      {isTh ? "หลักสูตรนี้มีจำนวนหน่วยกิตรวมทั้งสิ้น" : "Total credits requirement:"}{" "}
                      <span className="font-bold text-foreground">{selectedItem.totalCredits}</span> {isTh ? "หน่วยกิต" : "Credits"}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "careers" && (
                <div className="space-y-4">
                  {selectedItem.careerPaths && selectedItem.careerPaths.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-brand" />
                        <span>{isTh ? "อาชีพที่สามารถประกอบได้หลังสำเร็จการศึกษา" : "Career Opportunities"}</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedItem.careerPaths.map((c, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl bg-muted/40 border border-border/40 text-xs text-foreground/90 flex items-start gap-2"
                          >
                            <span className="text-brand font-bold">•</span>
                            <span className="leading-snug">{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedItem.qualifications && (
                    <div className="space-y-2 pt-2 border-t border-border/40">
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-brand" />
                        <span>{isTh ? "คุณสมบัติของผู้เข้าศึกษา" : "Admission Qualifications"}</span>
                      </h4>
                      <p className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-2xl leading-relaxed border border-border/40">
                        {selectedItem.qualifications}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/60">
              {selectedItem.brochurePdfUrl ? (
                <a
                  href={selectedItem.brochurePdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-xs font-semibold text-foreground transition-colors"
                >
                  <Download className="w-4 h-4 text-brand" />
                  <span>{isTh ? "ดาวน์โหลดเล่ม มคอ. 2 ฉบับเต็ม (PDF)" : "Download Full TQF 2 Document"}</span>
                </a>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {isTh ? "ปิด" : "Close"}
                </button>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl bg-brand text-on-brand text-xs font-semibold hover:bg-brand/90 transition-colors"
                >
                  {isTh ? "สมัครเข้าศึกษา" : "Apply Now"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
