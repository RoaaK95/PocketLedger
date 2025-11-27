import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { signOut } from "firebase/auth";
import { useCallback, useEffect, useState } from "react";
import { ActionSheetIOS, Alert, Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { auth } from "../../firebase/config";
import { loadUserProfileFromFirebase } from "../../firebase/sync";
import { useAuth } from "../../hooks/useAuth";

export default function Settings() {
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const loadUserName = useCallback(async () => {
    if (!user) return;
    
    console.log("Loading user name for:", user.uid);
    console.log("User displayName from auth:", user.displayName);
    
    try {
      // First try to get from local storage
      let storedName = await AsyncStorage.getItem(`user_name_${user.uid}`);
      console.log("Stored name from AsyncStorage:", storedName);
      
      // If not in local storage, try to load from Firebase
      if (!storedName) {
        console.log("No stored name, trying Firebase...");
        storedName = await loadUserProfileFromFirebase(user.uid);
        console.log("Name from Firebase:", storedName);
      }
      
      const finalName = storedName || user.displayName || "";
      console.log("Final display name:", finalName);
      setDisplayName(finalName);

      // Load profile image
      const storedImage = await AsyncStorage.getItem(`user_image_${user.uid}`);
      if (storedImage) {
        setProfileImage(storedImage);
      }
    } catch (error) {
      console.error("Error loading name:", error);
      setDisplayName(user.displayName || "");
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserName();
    }
  }, [user, loadUserName]);

  const handleOpenModal = () => {
    loadUserName(); // Reload name when opening modal
    setModalVisible(true);
  };

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setProfileImage(imageUri);
      if (user) {
        await AsyncStorage.setItem(`user_image_${user.uid}`, imageUri);
        await AsyncStorage.setItem(`user_image_pending_sync_${user.uid}`, 'true');
      }
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your camera.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setProfileImage(imageUri);
      if (user) {
        await AsyncStorage.setItem(`user_image_${user.uid}`, imageUri);
        await AsyncStorage.setItem(`user_image_pending_sync_${user.uid}`, 'true');
      }
    }
  };

  const handleImagePicker = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex: number) => {
          if (buttonIndex === 1) {
            takePhoto();
          } else if (buttonIndex === 2) {
            pickImageFromGallery();
          }
        }
      );
    } else {
      Alert.alert(
        'Select Image',
        'Choose an option',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: takePhoto },
          { text: 'Choose from Library', onPress: pickImageFromGallery },
        ],
        { cancelable: true }
      );
    }
  };

  const handleSaveName = async () => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      await AsyncStorage.setItem(`user_name_${user.uid}`, displayName);
      await AsyncStorage.setItem(`user_name_pending_sync_${user.uid}`, 'true');
      setModalVisible(false);
    } catch (error) {
      console.error("Error saving name:", error);
      Alert.alert("Error", "Failed to save name. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="settings" size={48} color="#4CAF50" />
          </View>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your account and preferences</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <Pressable style={styles.settingItem} onPress={handleOpenModal}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.settingIcon} />
            <Text style={styles.settingText}>Profile</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </Pressable>

          
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.settingItem}>
            <Ionicons name="moon-outline" size={20} color="#666" style={styles.settingIcon} />
            <Text style={styles.settingText}>Dark Mode</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </View>
 
        </View>

        <Pressable 
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          <Ionicons name="log-out-outline" size={20} color="white" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profile Information</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color="#666" />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.profileIconContainer}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.profileImage} />
                ) : (
                  <Ionicons name="person-circle" size={80} color="#4CAF50" />
                )}
                <Pressable style={styles.addPhotoButton} onPress={handleImagePicker}>
                  <Ionicons name="add-circle" size={32} color="#4CAF50" />
                </Pressable>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.editableInput}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Enter your name"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.readonlyInput}
                  value={user?.email || ""}
                  editable={false}
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveName}
                disabled={isSaving}
              >
                <Text style={styles.saveButtonText}>
                  {isSaving ? "Saving..." : "Save"}
                </Text>
              </Pressable>
              
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 24,
    paddingTop:80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#f44336',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  modalBody: {
    marginBottom: 24,
  },
  profileIconContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5f5f5',
  },
  addPhotoButton: {
    position: 'absolute',
    bottom: -5,
    right: '35%',
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  readonlyInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#666',
  },
  editableInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});
