import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { MyText, MyView } from '@/components/Themed';

export default function ModalScreen() {
  return (
    <MyView className="flex-1 items-center justify-center">
      <MyText className="text-2xl font-bold">Modal</MyText>
      <MyView className="my-8 h-px w-4/5 bg-gray-300 dark:bg-gray-700" />
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </MyView>
  );
}
