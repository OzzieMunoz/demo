import React, { useState, useEffect, useLayoutEffect } from 'react';
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
import { API_BASE_URL, API_ROUTES, getAuthHeaders } from '../../client/config';

const UserScreen = ({ navigation }) => {
    useLayoutEffect(() => {
        navigation.setOptions({ headerShown: Platform.OS !== 'web' });
    }, [navigation]);

    const { currentUser, logout } = useAuth();
    const { selectedAssignment } = useClassroom();
    const [isLoading, setIsLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [results, setResults] = useState<CodeRunInfo | null>(null);
    const [submissionInfo, setSubmissionInfo] = useState<Submission[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchSubmissions = async () => {
        if (!currentUser?.user_id || !selectedAssignment?.assignment_id) return;

        setIsLoading(true);
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/submissions/user/${currentUser.user_id}/assignment/${selectedAssignment.assignment_id}`, { headers });

            if (!response.ok) {
                throw new Error(`Failed to fetch submissions: ${response.status}`);
            }

            const data = await response.json();
            const submissions = data.data || [];
            setSubmissionInfo(submissions);

            if (submissions.length > 0) {
                setSubmitted(true);
                try {
                    const parsedResults = JSON.parse(submissions[0].results) as CodeRunInfo;
                    setResults(parsedResults);
                } catch (err) {
                    console.log("Error parsing results:", err);
                    setResults(null);
                }
            } else {
                setSubmitted(false);
                setResults(null);
            }
        } catch (error) {
            console.error("Error fetching submissions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser?.user_id && selectedAssignment?.assignment_id) {
            fetchSubmissions();
        }
    }, [currentUser, selectedAssignment]);

    const handleDeleteSubmission = async (submissionId: number) => {
        if (Platform.OS === 'web') {
            if (!confirm('Are you sure you want to delete this submission?')) return;
        } else {
            Alert.alert(
                'Confirm Deletion',
                'Are you sure you want to delete this submission?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => performDelete(submissionId),
                    },
                ]
            );
            return;
        }

        performDelete(submissionId);
    };

    const performDelete = async (submissionId: number) => {
        setIsDeleting(true);
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(API_ROUTES.submissions.delete(submissionId), {
                method: 'DELETE',
                headers,
            });

            if (!response.ok) {
                throw new Error(`Failed to delete submission: ${response.status}`);
            }

            await fetchSubmissions();
        } catch (error) {
            console.error("Error deleting submission:", error);
            Alert.alert('Error', 'Failed to delete submission. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    if (!selectedAssignment) {
        return (
            <View style={[layout.centered, { backgroundColor: '#061811' }]}>
                <Text style={{ color: 'white' }}>Please select an assignment from the classroom screen.</Text>
            </View>
        );
    }

    if (isLoading) {
        return (
            <View style={[layout.loadingContainer, { backgroundColor: '#061811' }]}>
                <ActivityIndicator size="large" color={'#88AB57'} />
                <Text style={{ marginTop: 10, color: 'white' }}>Loading...</Text>
            </View>
        );
    }

    if (!currentUser) {
        return (
            <View style={[layout.centered, { backgroundColor: '#061811' }]}>
                <Text style={{ color: 'white' }}>Please log in to access this page.</Text>
            </View>
        );
    }

    const renderAssignmentDetails = () => (
        <>
            <Text style={styles.assignmentTitle}>{selectedAssignment.title}</Text>
            {selectedAssignment.description && <Text style={styles.description}>{selectedAssignment.description}</Text>}
            {selectedAssignment.due_date && <Text style={styles.dueDate}>Due: {new Date(selectedAssignment.due_date).toLocaleDateString()}</Text>}
        </>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Custom Header */}
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
                {currentUser.role === 1 && (
                    <TouchableOpacity onPress={() => navigation.navigate('Admin')}>
                        <Text style={styles.navLink}>Admin</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.signOutBtn} onPress={logout}>
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.pageTitle}>User</Text>

            <View style={styles.contentWrapper}>
                {renderAssignmentDetails()}

                {submitted && results ? (
                    <>
                        <ResultsPlot results={results} />
                        <Button
                            mode="contained"
                            style={styles.deleteButton}
                            labelStyle={styles.deleteButtonLabel}
                            onPress={() => handleDeleteSubmission(submissionInfo[0].submission_id)}
                            loading={isDeleting}
                            disabled={isDeleting}
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
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    logo: { width: 40, height: 40, resizeMode: 'contain', marginRight: 12 },
    navLink: { fontSize: 40, lineHeight: 40, fontFamily: 'YoungFrankExpand', color: '#88AB57', marginHorizontal: 12 },
    activeNavLink: { textDecorationLine: 'underline' },
    signOutBtn: { marginLeft: 'auto', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 32, backgroundColor: '#88AB57' },
    signOutText: { color: '#FFFFFF', fontFamily: 'YoungFrankExpand', fontSize: 18 },
    pageTitle: { fontSize: 40, fontFamily: 'YoungFrankExpand', color: '#88AB57', textAlign: 'center', marginBottom: 20 },
    contentWrapper: { backgroundColor: '#061811', alignItems: 'center' },
    assignmentTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#EAEAEA', textAlign: 'center' },
    description: { fontSize: 16, marginBottom: 16, color: '#EAEAEA', textAlign: 'center' },
    dueDate: { fontStyle: 'italic', marginBottom: 24, color: '#EAEAEA', textAlign: 'center' },
    uploadTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#EAEAEA', textAlign: 'center' },
    deleteButton: { marginTop: 20, alignSelf: 'center', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 32, backgroundColor: '#E53935' },
    deleteButtonLabel: { color: '#FFFFFF', fontFamily: 'YoungFrankExpand', fontSize: 20 },
});

export default UserScreen;
