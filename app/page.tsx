"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings } from "lucide-react";
import Image from "next/image";

/**
 * Component to filter and display the list of dog breeds with checkboxes.
 * This allows users to select breeds from the filtered list.
 */
function BreedSelector({ breeds, selectedBreeds, onSelect, searchTerm }: any) {
  const filteredBreeds = breeds.filter((breed: string) =>
    breed.toLowerCase().includes(searchTerm)
  );

  return (
    <ScrollArea className="h-[calc(100vh-250px)] rounded-md border p-4">
      {filteredBreeds.map((breed: string) => (
        <div
          key={breed}
          className="flex items-center space-x-2 mb-2 p-2 rounded checkbox-item"
        >
          <Checkbox
            id={breed}
            checked={selectedBreeds.includes(breed)}
            onCheckedChange={() => onSelect(breed)}
          />
          <label
            htmlFor={breed}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {breed}
          </label>
        </div>
      ))}
    </ScrollArea>
  );
}

/**
 * Main component for the Dog Breed Gallery page.
 * Manages state for dog breeds, selected breeds, theme, and the image gallery.
 */
export default function Home() {
  const [breeds, setBreeds] = useState<string[]>([]);  // List of all breeds
  const [selectedBreeds, setSelectedBreeds] = useState<string[]>([]);  // User-selected breeds
  const [searchTerm, setSearchTerm] = useState("");  // Search term for filtering breeds
  const [images, setImages] = useState<Array<{ url: string; breed: string }>>([]);  // List of breed images
  const [theme, setTheme] = useState("light");  // Currently selected theme (light/dark)
  const [showBreedNames, setShowBreedNames] = useState(true);  // Toggle for showing breed names on images
  const [error, setError] = useState<string | null>(null);  // State to handle error messages

  /**
   * Fetches the list of dog breeds on initial render.
   */
  useEffect(() => {
    fetchBreeds();
  }, []);

  /**
   * Fetches images for the selected breeds when `selectedBreeds` changes.
   */
  useEffect(() => {
    if (selectedBreeds.length > 0) {
      fetchImages();
    } else {
      setImages([]);
    }
  }, [selectedBreeds]);

  /**
   * Updates the document body class when the theme changes.
   */
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  /**
   * Fetches the list of dog breeds from the Dog API.
   * Uses try-catch for error handling.
   */
  const fetchBreeds = async () => {
    try {
      const response = await fetch("https://dog.ceo/api/breeds/list/all");
      const data = await response.json();
      setBreeds(Object.keys(data.message).sort());  // Set the breed list alphabetically
    } catch (error) {
      setError("Error fetching breeds");
      console.error("Error fetching breeds:", error);
    }
  };

  /**
   * Fetches images for the selected breeds.
   * Calls the API for each selected breed and gathers random images.
   */
  const fetchImages = async () => {
    try {
      const imagePromises = selectedBreeds.map((breed) =>
        fetch(`https://dog.ceo/api/breed/${breed}/images/random/3`).then((res) =>
          res.json()
        )
      );
      const imageResults = await Promise.all(imagePromises);
      const allImages = imageResults.flatMap((result, index) =>
        result.message.map((url: string) => ({ url, breed: selectedBreeds[index] }))
      );
      setImages(allImages);
    } catch (error) {
      setError("Error fetching images");
      console.error("Error fetching images:", error);
    }
  };

  /**
   * Toggles the selection of a breed.
   * Adds or removes a breed from the selectedBreeds array.
   */
  const handleBreedSelection = (breed: string) => {
    setSelectedBreeds((prev) =>
      prev.includes(breed) ? prev.filter((b) => b !== breed) : [...prev, breed]
    );
  };

  /**
   * Updates the search term for filtering breeds.
   */
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  /**
   * Randomly selects 3 breeds from the breed list.
   */
  const loadRandomBreeds = () => {
    const randomBreeds = [...breeds]
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    setSelectedBreeds(randomBreeds);
  };

  return (
    <main className={`container mx-auto p-4 ${theme}`}>
      {/* Global Styles for themes and interactions */}
      <style jsx global>{`
        .light {
          background-color: #ffffff;
          color: #000000;
        }
        .dark {
          background-color: #1a1a1a;
          color: #ffffff;
        }
        .dog-theme {
          background-color: #f5e6d3;
          color: #5d4037;
        }
        .dog-theme .highlighted {
          box-shadow: 0 0 10px 5px #d7ccc8;
        }

        .image-container {
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease;
        }

        .image-container:hover {
          transform: scale(1.05);
        }

        .breed-name {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 8px;
          transform: translateY(100%);
          transition: transform 0.3s ease;
        }

        .image-container:hover .breed-name {
          transform: translateY(0);
        }

        .always-show .breed-name {
          transform: translateY(0);
        }

        .checkbox-item {
          transition: background-color 0.3s ease;
        }

        .checkbox-item:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
      `}</style>

      {/* Display error message if any */}
      {error && <div className="error-message">{error}</div>}

      {/* Header with settings icon for theme customization */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dog Breed Gallery</h1>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Open Settings">
              <Settings className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Settings</h4>
                <p className="text-sm text-muted-foreground">
                  Customize your gallery experience
                </p>
              </div>
              <div className="grid gap-2">
                <div className="grid gap-2">
                  {/* Theme selection (Light, Dark, Dog Theme) */}
                  <Label htmlFor="theme">Theme</Label>
                  <RadioGroup
                    id="theme"
                    defaultValue={theme}
                    onValueChange={setTheme}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="light" />
                      <Label htmlFor="light">Light</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dark" id="dark" />
                      <Label htmlFor="dark">Dark</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dog-theme" id="dog-theme" />
                      <Label
                        htmlFor="dog-theme"
                        className={theme === "dog-theme" ? "highlighted" : ""}
                      >
                        Dog Theme
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-breed-names"
                    checked={showBreedNames}
                    onCheckedChange={setShowBreedNames}
                  />
                  <Label htmlFor="show-breed-names">
                    Always show breed names
                  </Label>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Main layout: Breed selection and image gallery */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/3 lg:w-1/4">
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Search breeds..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full"
            />
          </div>
          <Button onClick={loadRandomBreeds} className="w-full mb-4">
            Load Random Breeds
          </Button>
          {/* Separated Breed Selector for choosing breeds */}
          <BreedSelector
            breeds={breeds}
            selectedBreeds={selectedBreeds}
            onSelect={handleBreedSelection}
            searchTerm={searchTerm}
          />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-2">Gallery</h2>
          {/* Image grid displaying selected breed images */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className={`rounded-lg overflow-hidden image-container ${
                  showBreedNames ? "always-show" : ""
                }`}
              >
                <Image
                  src={image.url}
                  alt={`${image.breed} dog`}
                  width={300}
                  height={300}
                  className="object-cover w-full h-full"
                  loading="lazy"  // Lazy loading for better performance
                />
                <div className="breed-name">{image.breed}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
