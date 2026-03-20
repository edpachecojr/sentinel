import { describe, it, expect } from "vitest";
import { generateSlug } from "@/utils/slug";

describe("generateSlug", () => {
  it("should convert to lowercase", () => {
    expect(generateSlug("TRANSPORTES XYZ")).toBe("transportes-xyz");
  });

  it("should replace spaces with hyphens", () => {
    expect(generateSlug("My Company Name")).toBe("my-company-name");
  });

  it("should remove accents", () => {
    expect(generateSlug("Açúcar & Café")).toBe("acucar-cafe");
  });

  it("should remove special characters", () => {
    expect(generateSlug("Company@2024!")).toBe("company-2024");
  });

  it("should collapse multiple hyphens", () => {
    expect(generateSlug("Company  ---  Name")).toBe("company-name");
  });

  it("should trim leading and trailing hyphens", () => {
    expect(generateSlug("---Company---")).toBe("company");
  });

  it("should handle empty strings", () => {
    expect(generateSlug("")).toBe("");
  });

  it("should handle only numbers", () => {
    expect(generateSlug("2024")).toBe("2024");
  });

  it("should normalize common characters", () => {
    expect(generateSlug("São Paulo Transportes")).toBe("sao-paulo-transportes");
  });
});
