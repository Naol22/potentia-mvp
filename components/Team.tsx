"use client";
import { LinkedinIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import Image from "next/image";
import { motion } from "framer-motion";

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  linkedinUrl?: string;
}

const team: TeamMember[] = [
  {
    name: "Robert Luft",
    role: "Chief Exectuive Officer",
    bio: "",
    image:
      "/Robert.jpeg",
    linkedinUrl: "https://www.linkedin.com/in/robluft/",
  },
  {
    name: "John Chain",
    role: "Chief Technology Officer",
    bio: "",
    image:
      "/john.jpeg",
    linkedinUrl: "https://www.linkedin.com/in/john-chain/",
  },
  {
    name: "Arlan Abdullin",
    role: "Director of Business Dev.",
    bio: "",
    image:
      "/Arlanpng.png",
    linkedinUrl: "https://www.linkedin.com/in/arlanabdullin/",
  },
  {
    name: "Abmelek Daniel",
    role: "Director of Africa Strategy",
    bio: "",
    image:
      "/Abmelek.jpeg",
    linkedinUrl: "https://www.linkedin.com/in/abemelek-daniel/",
  },
];

const Team: React.FC = () => {
  return (
    <div className="w-full bg-black text-white flex justify-center items-center">
      <div className="container py-24 lg:py-32 p-10">
        {/* Title */}
        <div className="max-w-2xl mx-auto text-center mb-10 lg:mb-14">
          <h2 className="text-3xl font-bold md:text-4xl md:leading-tight text-white">
            Team Members
          </h2>
          {/* <p className="mt-1 text-lg text-white">
            The amazing people behind the scenes
          </p> */}
        </div>
        {/* End Title */}

        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 place-items-center max-w-[90%] mx-auto px-4"
          initial="show"
          whileInView="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.5,
              },
            },
          }}
        >
        {team.map((member) => (
          <motion.div
            key={member.name}
            className="rounded-lg group relative overflow-hidden border-2 border-neutral-600 shadow-lg hover:shadow-2xl transition-shadow w-full max-w-xs"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <CardContent className="p-0">
              <div className="relative">
                <Image
                  className="w-full aspect-[3/4] object-cover"
                  src={member.image}
                  alt={member.name}
                  width={320}
                  height={420}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-background/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition">
                  <p className="text-sm">{member.bio}</p>
                  <div className="mt-3 flex gap-1">
                    {/* <Button size="icon" variant="secondary">
                      <Twitter className="size-4" />
                    </Button>
                    <Button size="icon" variant="secondary">
                      <Github className="size-4" />
                    </Button> */}
                    {member.linkedinUrl && (
                      <Button size="icon" variant="secondary" asChild>
                        <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer">
                          <LinkedinIcon className="size-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-white">{member.name}</h3>
                <p className="text-sm text-white mt-1">{member.role}</p>
              </div>
            </CardContent>
          </motion.div>
        ))}
      </motion.div>
        {/* End Grid */}
      </div>
    </div>
  );
};

export default Team;