import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Modal from 'react-native-modal';
import { MyText, MyView } from './Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

interface BottomSheetModalProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const BottomSheetModal: React.FC<BottomSheetModalProps> = ({ isVisible, onClose, children }) => {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme ? Colors[colorScheme].background : Colors.light.background;

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      swipeDirection="down"
      onSwipeComplete={onClose}
      style={Platform.OS === 'android' ? styles.bottomSheet : styles.modal}
    >
      <MyView style={[Platform.OS === 'android' ? styles.bottomSheetContent : styles.modalContent, { backgroundColor }]}>
        {children}
      </MyView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  bottomSheetContent: {
    padding: 22,
    borderTopLeftRadius: 17,
    borderTopRightRadius: 17,
    height: '80%',
  },
  modal: {
    justifyContent: 'center',
    margin: 0,
  },
  modalContent: {
    padding: 22,
    borderRadius: 17,
  },
});

export default BottomSheetModal;