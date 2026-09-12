import Home from "@/components/Home";
import JsonLd from "@/components/JsonLd";

const websiteSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://next.sagarpanda.com/#website",
      name: "Sagar Panda | DevOps & Cloud Engineer",
      url: "https://next.sagarpanda.com/",
      description:
        "Senior DevOps Engineer specializing in AWS, Kubernetes, and Terraform. Sharing practical tutorials on cloud infrastructure, CI/CD, observability, and DevSecOps.",
      inLanguage: "en",
      author: {
        "@id": "https://next.sagarpanda.com/#person",
      },
    },
    {
      "@type": "Person",
      "@id": "https://next.sagarpanda.com/#person",
      name: "Sagar Panda",
      url: "https://next.sagarpanda.com/",
      jobTitle: "DevOps & Cloud Engineer",
    },
  ],
};

export default function Page() {
  return (
    <>
      <JsonLd data={websiteSchema} />
      <Home />
    </>
  );
}