import React from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

interface IconProps {
  type: 'FontAwesome' | 'Entypo' | 'MaterialIcons' | 'Ionicons';
  name: string;
  size?: number;
  color?: string;
}

const Icon: React.FC<IconProps> = ({ type, name, size = 24, color = 'black' }) => {
  switch (type) {
    case 'FontAwesome':
      return <FontAwesome name={name as any} size={size} color={color} />;
    case 'Entypo':
      return <Entypo name={name as any} size={size} color={color} />;
    case 'MaterialIcons':
      return <MaterialIcons name={name as any} size={size} color={color} />;
    case 'Ionicons':
      return <Ionicons name={name as any} size={size} color={color} />;
    default:
      return null;
  }
};

export default Icon;