import DocumentPage from '@/components/DocumentPage';
import { PRIVACY_POLICY_MD } from '@/data/privacy-policy';

function PrivacyPolicyPage() {
    return <DocumentPage title="Privacy Policy" content={PRIVACY_POLICY_MD} />;
}
export default PrivacyPolicyPage;
