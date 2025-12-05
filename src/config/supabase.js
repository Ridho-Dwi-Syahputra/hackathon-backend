const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Validasi environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Konfigurasi Supabase tidak lengkap di file .env');
    console.error('🔧 Pastikan SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY sudah diisi');
    process.exit(1);
}

console.log('🔗 Menginisialisasi Supabase Client...');
console.log('📡 URL:', process.env.SUPABASE_URL);
console.log('🔑 Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...');

// Initialize Supabase client dengan service role key (untuk server-side operations)
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// Test connection dan list buckets
const testSupabaseConnection = async () => {
    try {
        console.log('🚀 Testing koneksi Supabase Storage...');
        
        // Test dengan list buckets
        const { data, error } = await supabase.storage.listBuckets();
        
        if (error) {
            throw new Error(error.message);
        }
        
        console.log('✅ Supabase Storage berhasil terhubung');
        console.log('🗂️  Bucket yang tersedia:', data.map(bucket => bucket.name).join(', '));
        
        // Check apakah bucket sako-assets ada
        const sakoAssetsBucket = data.find(bucket => bucket.name === 'sako-assets');
        if (sakoAssetsBucket) {
            console.log('✅ Bucket "sako-assets" ditemukan dan siap digunakan');
            console.log('📊 Status bucket:', sakoAssetsBucket.public ? 'Public' : 'Private');
        } else {
            console.log('⚠️  Bucket "sako-assets" tidak ditemukan');
            console.log('📝 Silakan buat bucket "sako-assets" di Supabase Dashboard');
            console.log('🔗 Dashboard: https://supabase.com/dashboard/project/lqdmiwpsmufcwziayoev/storage/buckets');
        }
        
    } catch (error) {
        console.error('❌ Koneksi Supabase gagal:', error.message);
        console.error('🔧 Periksa credentials Supabase di file .env');
        console.error('📋 SUPABASE_URL:', process.env.SUPABASE_URL);
        console.error('📋 SERVICE_KEY valid:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Ada' : 'Tidak ada');
    }
};

// Helper function untuk upload gambar ke bucket sako-assets
const uploadImageToSako = async (fileName, fileBuffer, contentType = 'image/jpeg') => {
    try {
        console.log('📤 Mengupload file:', fileName, 'ke bucket sako-assets');
        
        const { data, error } = await supabase.storage
            .from('sako-assets')
            .upload(fileName, fileBuffer, {
                contentType: contentType,
                duplex: 'half',
                upsert: false // jangan overwrite file yang sama
            });

        if (error) {
            throw error;
        }

        // Get public URL untuk disimpan di database
        const { data: publicUrlData } = supabase.storage
            .from('sako-assets')
            .getPublicUrl(fileName);

        console.log('✅ Upload berhasil:', publicUrlData.publicUrl);

        return {
            success: true,
            data: data,
            publicUrl: publicUrlData.publicUrl,
            fileName: fileName
        };

    } catch (error) {
        console.error('❌ Upload gagal:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
};

// Helper function untuk hapus gambar dari bucket sako-assets
const deleteImageFromSako = async (fileName) => {
    try {
        console.log('🗑️  Menghapus file:', fileName, 'dari bucket sako-assets');
        
        const { error } = await supabase.storage
            .from('sako-assets')
            .remove([fileName]);

        if (error) {
            throw error;
        }

        console.log('✅ File berhasil dihapus:', fileName);
        return { success: true };

    } catch (error) {
        console.error('❌ Gagal hapus file:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
};

// Helper function untuk list semua file di bucket
const listFilesInSako = async (path = '') => {
    try {
        const { data, error } = await supabase.storage
            .from('sako-assets')
            .list(path);

        if (error) {
            throw error;
        }

        return {
            success: true,
            files: data.map(file => ({
                name: file.name,
                size: file.metadata?.size || 0,
                created_at: file.created_at,
                updated_at: file.updated_at,
                publicUrl: supabase.storage.from('sako-assets').getPublicUrl(path + file.name).data.publicUrl
            }))
        };

    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Auto-test koneksi saat file ini di-import
const initializeSupabase = async () => {
    console.log('🚀 Menginisialisasi Supabase untuk SAKO...');
    await testSupabaseConnection();
};

// Jalankan test koneksi
initializeSupabase();

module.exports = {
    supabase,
    testSupabaseConnection,
    uploadImageToSako,
    deleteImageFromSako,
    listFilesInSako
};