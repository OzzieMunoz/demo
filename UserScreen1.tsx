import React, { useState, useLayoutEffect } from 'react';
import {
    ScrollView,
    View,
    Text,
    ActivityIndicator,
    Alert,
    Platform,
    StyleSheet,
    TouchableOpacity,
    Image,
} from 'react-native';
import { Button } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useClassroom } from '../context/ClassroomContext';
import { Submission } from '../../shared/types/databaseobjects';
import { CodeRunInfo } from '../../shared/types/coderuninfo';
import FileUpload from '../components/FileUpload';
import ResultsPlot from '../components/ResultsPlot';
import { layout } from '../styles/layout';

// Mock data for preview
const mockUser = {
    user_id: 'USER12345',
    first_name: 'Alex',
    last_name: 'Johnson',
    email: 'alex.johnson@example.com',
    image_url: 'https://i.pravatar.cc/150?img=3',
    role: 1,
};
const mockAssignment = {
    assignment_id: 999,
    title: 'Mock Assignment',
    description: 'This is a mock assignment description for preview purposes.',
    due_date: new Date().toISOString(),
};
const mockResults: CodeRunInfo = { time: [0,1,2,3,4], score: [10,20,30,25,15] };
const mockSubmissionInfo: Submission[] = [
    { submission_id:1, user_id:mockUser.user_id, assignment_id:mockAssignment.assignment_id, results: JSON.stringify(mockResults) }
];

type UserScreenProps = { navigation: any };

const UserScreen: React.FC<UserScreenProps> = ({ navigation }) => {
    // Hide native header on web, show on mobile
    useLayoutEffect(() => {
        navigation.setOptions({ headerShown: Platform.OS !== 'web' });
    }, [navigation]);

    const { currentUser, logout } = useAuth();
    const user = currentUser ?? mockUser;
    const { selectedAssignment } = useClassroom();
    const assignment = selectedAssignment ?? mockAssignment;

    const [isLoading] = useState(false);
    const [submitted] = useState(true);
    const [results] = useState<CodeRunInfo>(mockResults);
    const [submissionInfo] = useState<Submission[]>(mockSubmissionInfo);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteSubmission = () => {
        Alert.alert('Mock Delete', 'Pretending to delete submission');
    };

    if (!user) {
        return (
            <View style={[layout.centered, styles.unauthContainer]}>
                <Text style={styles.unauthText}>Please log in to access this page.</Text>
            </View>
        );
    }

    if (isLoading) {
        return (
            <View style={layout.loadingContainer}>
                <ActivityIndicator size="large" color="#88AB57" />
                <Text style={{ marginTop: 10, color: '#FFFFFF' }}>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                    <Image source={require('../../assets/frankenweb-logo-v1.png')} style={styles.logo} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('User')}>
                    <Text style={[styles.navLink, styles.activeNavLink]}>User</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Leaderboard')}>
                    <Text style={styles.navLink}>Leaderboard</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                    <Text style={styles.navLink}>Profile</Text>
                </TouchableOpacity>
                {user.role === 1 && (
                    <TouchableOpacity onPress={() => navigation.navigate('Admin')}>
                        <Text style={styles.navLink}>Admin</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.signOutBtn} onPress={logout}>
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>

            {/* Page Title */}
            <Text style={styles.pageTitle}>User</Text>

            {/* Content */}
            <View style={styles.contentWrapper}>
                <Text style={styles.title}>{assignment.title}</Text>
                <Text style={styles.description}>{assignment.description}</Text>
                <Text style={styles.due}>Due: {new Date(assignment.due_date).toLocaleDateString()}</Text>

                {submitted && results ? (
                    <>
                        <ResultsPlot results={results} />
                        <Button
                            mode="contained"
                            buttonColor="#E53935"
                            onPress={handleDeleteSubmission}
                            loading={isDeleting}
                            disabled={isDeleting}
                            style={styles.deleteButton}
                            labelStyle={styles.deleteButtonLabel}
                        >
                            Delete Submission
                        </Button>
                    </>
                ) : (
                    <>
                        <Text style={styles.uploadTitle}>Upload Your File</Text>
                        <FileUpload />
                    </>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#061811' },
    contentContainer: { padding: 30 },
    unauthContainer: { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#061811' },
    unauthText: { color:'#FFFFFF', fontSize:16 },
    header: { flexDirection:'row', alignItems:'center', marginBottom:10 },
    logo: { width:40, height:40, resizeMode:'contain', marginRight:12 },
    navLink: { fontSize:40, lineHeight:40, fontFamily:'YoungFrankExpand', color:'#88AB57', marginHorizontal:12 },
    activeNavLink: { textDecorationLine:'underline' },
    signOutBtn: { marginLeft:'auto', paddingHorizontal:24, paddingVertical:12, borderRadius:32, backgroundColor:'#88AB57' },
    signOutText: { color:'#FFFFFF', fontFamily:'YoungFrankExpand', fontSize:18 },
    pageTitle: { fontSize:40, fontFamily:'YoungFrankExpand', color:'#88AB57', textAlign:'center', marginBottom:20 },
    contentWrapper: { backgroundColor:'#061811', alignItems:'center' },
    title: { fontSize:24, fontWeight:'bold', marginBottom:16, color:'#EAEAEA', textAlign:'center' },
    description: { fontSize:16, marginBottom:16, color:'#EAEAEA', textAlign:'center' },
    due: { fontStyle:'italic', marginBottom:24, color:'#EAEAEA', textAlign:'center' },
    uploadTitle: { fontSize:20, fontWeight:'bold', marginBottom:16, color:'#EAEAEA', textAlign:'center' },
    deleteButton: { marginTop:20, alignSelf:'center', paddingVertical:12, paddingHorizontal:24, borderRadius:32 },
    deleteButtonLabel: { color:'#FFFFFF', fontFamily:'YoungFrankExpand', fontSize:20 },
});

export default UserScreen;
