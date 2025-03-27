import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { MyText, MyView } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Stack } from 'expo-router';
import { useAuth } from '@/context/auth.context';
import { View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileModal() {
  const colorScheme = useColorScheme();
  const textColor = colorScheme ? Colors[colorScheme].text : Colors.light.text;
  const bgColor = colorScheme ? Colors[colorScheme].background : Colors.light.background;
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <Stack.Screen
        options={{
          title: 'Mi Perfil',
          presentation: 'modal',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: bgColor,
          },
        }}
      />

      <MyView style={styles.container}>
        <MyView style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: textColor }]}>
            <MyText 
              style={[styles.avatarText, { 
                color: textColor === Colors.light.text ? Colors.dark.text : Colors.light.text 
              }]}
            >
              {user?.name.charAt(0).toUpperCase() || 'U'}
            </MyText>
          </View>
          <MyText style={styles.name}>{user?.name || 'Usuario'}</MyText>
          <MyText style={styles.email}>{user?.email || 'email@example.com'}</MyText>
        </MyView>

        <MyView style={styles.section}>
          <MyText style={styles.sectionTitle}>Configuración</MyText>
          
          <TouchableOpacity style={styles.menuItem}>
            <FontAwesome name="user" size={18} color={textColor} />
            <MyText style={styles.menuItemText}>Editar Perfil</MyText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <FontAwesome name="bell" size={18} color={textColor} />
            <MyText style={styles.menuItemText}>Notificaciones</MyText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <FontAwesome name="lock" size={18} color={textColor} />
            <MyText style={styles.menuItemText}>Privacidad y Seguridad</MyText>
          </TouchableOpacity>
        </MyView>

        <TouchableOpacity 
          style={[styles.logoutButton, { borderColor: '#ff3b30' }]}
          onPress={handleLogout}
        >
          <FontAwesome name="sign-out" size={18} color="#ff3b30" />
          <MyText style={[styles.logoutText, { color: '#ff3b30' }]}>Cerrar Sesión</MyText>
        </TouchableOpacity>
      </MyView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginVertical: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: 'gray',
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});