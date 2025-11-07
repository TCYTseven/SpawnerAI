"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { useState, useMemo } from "react";
import { mockChampions, Champion } from "@/types/mock";

interface ChampionSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (champion: Champion) => void;
  currentRole?: "Top" | "Jungle" | "Mid" | "ADC" | "Support";
  currentChampionId?: string;
}

export function ChampionSelector({
  isOpen,
  onClose,
  onSelect,
  currentRole,
  currentChampionId,
}: ChampionSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | undefined>(currentRole);

  const filteredChampions = useMemo(() => {
    let champs = mockChampions;

    // Filter by role if selected
    if (selectedRole) {
      champs = champs.filter((c) => c.role === selectedRole);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      champs = champs.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return champs;
  }, [searchQuery, selectedRole]);

  const roles: Array<"Top" | "Jungle" | "Mid" | "ADC" | "Support"> = [
    "Top",
    "Jungle",
    "Mid",
    "ADC",
    "Support",
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        base: "bg-[#0d0d0d]",
        header: "border-b border-[#2b2b2b]",
        body: "py-4",
        footer: "border-t border-[#2b2b2b]",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold text-white">Select Champion</h2>
              <p className="text-sm text-[#cfcfcf]">Choose a champion for this role</p>
            </ModalHeader>
            <ModalBody>
              {/* Search and Filters */}
              <div className="space-y-4">
                <Input
                  placeholder="Search champions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  classNames={{
                    input: "text-white",
                    inputWrapper: "bg-[#1a1a1a] border-[#2b2b2b]",
                  }}
                  startContent={
                    <svg className="w-5 h-5 text-[#cfcfcf]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                />

                {/* Role Filters */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={selectedRole === undefined ? "solid" : "bordered"}
                    className={
                      selectedRole === undefined
                        ? "bg-[#ff7a00] text-white"
                        : "border-[#2b2b2b] text-[#cfcfcf] hover:border-[#ff7a00]"
                    }
                    onPress={() => setSelectedRole(undefined)}
                  >
                    All
                  </Button>
                  {roles.map((role) => (
                    <Button
                      key={role}
                      size="sm"
                      variant={selectedRole === role ? "solid" : "bordered"}
                      className={
                        selectedRole === role
                          ? "bg-[#ff7a00] text-white"
                          : "border-[#2b2b2b] text-[#cfcfcf] hover:border-[#ff7a00]"
                      }
                      onPress={() => setSelectedRole(role)}
                    >
                      {role}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Champions Grid */}
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-4">
                {filteredChampions.map((champion) => (
                  <Card
                    key={champion.id}
                    className={`bg-[#1a1a1a] border-2 cursor-pointer transition-all ${
                      currentChampionId === champion.id
                        ? "border-[#ff7a00] ring-2 ring-[#ff7a00]/50"
                        : "border-[#2b2b2b] hover:border-[#ff7a00]/50"
                    }`}
                    onPress={() => {
                      onSelect(champion);
                      onClose();
                    }}
                  >
                    <CardBody className="p-3 space-y-2">
                      <div className="aspect-square bg-[#0d0d0d] rounded-lg flex items-center justify-center border border-[#2b2b2b]">
                        <span className="text-2xl">🎮</span>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-white">{champion.name}</div>
                        <Chip
                          size="sm"
                          className="bg-[#0d0d0d] text-[#cfcfcf] border border-[#2b2b2b] text-xs mt-1"
                        >
                          {champion.role}
                        </Chip>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>

              {filteredChampions.length === 0 && (
                <div className="text-center py-8 text-[#cfcfcf]">
                  No champions found matching your search.
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose} className="text-[#cfcfcf]">
                Cancel
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

