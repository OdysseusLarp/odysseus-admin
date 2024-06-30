<template>
    <p>
        <span class="cl"><strong>{{ this.fusebox.name || this.fusebox.id }}</strong></span>
        <span class="cl">{{ this.intact }} / {{ this.total }} intact</span>
        <span class="cl" :class="this.dmxStatus ? '' : 'red'">DMX fuse is {{ this.dmxStatus ? 'OK' : 'BROKEN' }}</span>
        <span class="cl" :class="this.fusebox.failed ? 'red' : ''">{{ this.fusebox.failed ? 'Fuses replaced by nails' :
            'Regular fuses in use' }}</span>
        <span class="cl">{{ this.fusebox.description }}</span>
    </p>
</template>

<script>
export default {
    props: {
        boxId: {
            type: String,
            required: true
        }
    },
    components: {},
    data() {
        return {
            channels: {},
            selectedChannel: undefined,
        };
    },
    computed: {
        fusebox() {
            return this.$store.state.dataBlobs.find((e) => e.type === 'box' && e.id === this.boxId);
        },
        total() {
            if (!this.fusebox) {
                return 'NA';
            }
            return this.fusebox.fuses.length;
        },
        intact() {
            if (!this.fusebox) {
                return 'NA';
            }
            return this.fusebox.fuses.filter(f => f).length;
        },
        dmxStatus() {
            return !!this.fusebox.fuses[this.fusebox.dmxFuse]
        }
    },

};
</script>

<style lang="scss" scoped>
.cl {
    min-width: 11em;
    display: inline-block;
}
</style>