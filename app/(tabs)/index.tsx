import { useState } from "react";
import { FlatList } from "react-native";
import AppCard from "@/components/AppCard";
import { MyView, MyText } from "@/components/Themed";
import { FontAwesome } from "@expo/vector-icons";

const initialApps = [
  {
    id: 1,
    name: "App One",
    description: "Description for App One",
    action: "Install",
    picture:
      "https://th.bing.com/th/id/R.cd17dba8ec1b9b59a2bdfb924eef622f?rik=9NrY7Ca%2bi1gICA&riu=http%3a%2f%2fclipartmag.com%2fimages%2fno-copyright-logos-31.jpg&ehk=jb4XKsTZYme8ksllpfUq%2fUFElwzibCk10wR0DKd7M5o%3d&risl=&pid=ImgRaw&r=0",
    hasUpdate: true,
  },
  {
    id: 2,
    name: "App Two",
    description: "Description for App Two",
    action: "Install",
    picture:
      "https://th.bing.com/th/id/OIP.TtZA6oudINHralYnRgtwxQHaHp?rs=1&pid=ImgDetMain",
    hasUpdate: false,
  },
  {
    id: 3,
    name: "App Three",
    description: "Description for App Three",
    action: "Install",
    picture:
      "https://th.bing.com/th/id/R.10c220ed1a4717188966b9a2201a81f5?rik=m1flukt2Mgno%2fg&pid=ImgRaw&r=0",
    hasUpdate: false,
  },
  {
    id: 4,
    name: "App Four",
    description: "Description for App Four",
    action: "Install",
    picture:
      "https://th.bing.com/th/id/R.10c220ed1a4717188966b9a2201a81f5?rik=m1flukt2Mgno%2fg&pid=ImgRaw&r=0",
    hasUpdate: true,
  },
];

export default function TabOneScreen() {
  const [apps, setApps] = useState(initialApps);

  const handleButtonClick = (id: number) => {
    setApps((prevApps) =>
      prevApps.map((app) =>
        app.id === id
          ? {
              ...app,
              action:
                app.action === "Install" || app.action === "Update"
                  ? "Installed"
                  : app.action,
              hasUpdate: false,
            }
          : app
      )
    );
  };

  return (
    <MyView className="flex-1">
      <MyText className="text-2xl font-bold m-5">
        Available Apps for Testing
      </MyText>
      <FlatList
        data={apps}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <AppCard
            picture={item.picture}
            name={item.name}
            description={item.description}
            buttonText={
              item.action === "Installed" ? (
                <FontAwesome name="check-circle" size={24} color="green" />
              ) : (
                item.action
              )
            }
            onButtonClick={() => handleButtonClick(item.id)}
            hasUpdate={item.hasUpdate}
          />
        )}
      />
    </MyView>
  );
}
